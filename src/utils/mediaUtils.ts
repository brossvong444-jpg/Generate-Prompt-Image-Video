/**
 * Media processing utilities for Image & Video Prompt Analyzer
 */

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

/**
 * Generates an interactive cinematic animated video clip on-the-fly using HTML5 Canvas & MediaRecorder
 * so users can test "Analyze Video to Prompt" instantly without having to supply a video file!
 */
export function createCinematicSampleVideo(theme: 'drone_landscape' | 'cyberpunk_tunnel' = 'drone_landscape'): Promise<{ blob: Blob; dataUrl: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Canvas 2D context not supported'));
      }

      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9' 
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            blob: finalBlob,
            dataUrl: reader.result as string,
            mimeType,
          });
        };
        reader.readAsDataURL(finalBlob);
      };

      recorder.start();

      let frame = 0;
      const totalFrames = 90; // 3 seconds at 30 fps

      function drawFrame() {
        if (!ctx) return;
        const t = frame / totalFrames;

        if (theme === 'drone_landscape') {
          // Dynamic sunset mountain flight
          const grad = ctx.createLinearGradient(0, 0, 0, 360);
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(0.4, '#b45309');
          grad.addColorStop(0.8, '#f59e0b');
          grad.addColorStop(1, '#fde68a');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 640, 360);

          // Glowing Sun
          const sunX = 320;
          const sunY = 160 + t * 20;
          ctx.beginPath();
          ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
          ctx.fillStyle = '#fffbeb';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 30;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Parallax Mountain Ridges
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.moveTo(0, 220);
          ctx.lineTo(150, 160);
          ctx.lineTo(340, 240);
          ctx.lineTo(500, 180);
          ctx.lineTo(640, 230);
          ctx.lineTo(640, 360);
          ctx.lineTo(0, 360);
          ctx.closePath();
          ctx.fill();

          // Foreground dynamic road with camera forward motion
          ctx.fillStyle = '#1c1917';
          ctx.beginPath();
          const roadCenter = 320 + Math.sin(t * Math.PI * 2) * 20;
          ctx.moveTo(roadCenter - 10, 220);
          ctx.lineTo(roadCenter + 10, 220);
          ctx.lineTo(560, 360);
          ctx.lineTo(80, 360);
          ctx.closePath();
          ctx.fill();

          // Moving road dashes
          ctx.fillStyle = '#f59e0b';
          for (let i = 0; i < 5; i++) {
            const dashT = (t * 3 + i / 5) % 1;
            const y = 220 + Math.pow(dashT, 2) * 140;
            const w = 4 + dashT * 12;
            const h = 6 + dashT * 18;
            const x = roadCenter - w / 2;
            ctx.fillRect(x, y, w, h);
          }

          // Flying birds in flock
          ctx.strokeStyle = '#292524';
          ctx.lineWidth = 2;
          for (let b = 0; b < 4; b++) {
            const bx = 100 + b * 45 + t * 140;
            const by = 80 + Math.sin(t * 8 + b) * 8;
            ctx.beginPath();
            ctx.moveTo(bx - 8, by);
            ctx.quadraticCurveTo(bx - 4, by - 5, bx, by);
            ctx.quadraticCurveTo(bx + 4, by - 5, bx + 8, by);
            ctx.stroke();
          }
        } else {
          // Cyberpunk light tunnel
          ctx.fillStyle = '#030712';
          ctx.fillRect(0, 0, 640, 360);

          const cx = 320;
          const cy = 180;
          for (let r = 8; r >= 1; r--) {
            const ringT = (t * 2 + r / 8) % 1;
            const radius = Math.pow(ringT, 2) * 260;
            ctx.strokeStyle = r % 2 === 0 ? '#06b6d4' : '#ec4899';
            ctx.lineWidth = 2 + ringT * 6;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // HUD overlay timecode
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = '13px monospace';
        const timeCode = `REC [●] 00:00:0${Math.floor(frame / 30)}:${(frame % 30).toString().padStart(2, '0')}`;
        ctx.fillText(timeCode, 20, 30);
        ctx.fillText('CAM-01 4K 60FPS 35MM', 20, 50);

        frame++;
        if (frame < totalFrames) {
          requestAnimationFrame(drawFrame);
        } else {
          recorder.stop();
        }
      }

      drawFrame();
    } catch (err) {
      reject(err);
    }
  });
}
