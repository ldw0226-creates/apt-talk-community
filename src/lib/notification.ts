// Notification & Sound System for Apt Talk Community

class NotificationManager {
  private audioCtx: AudioContext | null = null;

  // Initialize Web Audio Context on first user interaction
  private initAudio() {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play pleasant "Tok!" message notification sound
  public playMessageSound() {
    try {
      const ctx = this.initAudio();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // Gentle friendly pop tone (frequency envelope: 580Hz -> 880Hz)
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio playback not allowed yet:", e);
    }
  }

  // Play official notice / urgent bell chime
  public playAlertSound() {
    try {
      const ctx = this.initAudio();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }

  // Trigger mobile vibration
  public triggerVibration(pattern: number | number[] = 50) {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // Check notification permission status
  public getPermissionStatus(): NotificationPermission {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }
    return Notification.permission;
  }

  // Request browser notification permission
  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.error("Failed to request notification permission:", e);
      return "denied";
    }
  }

  // Send Browser System Push Notification
  public sendPushNotification(title: string, options?: NotificationOptions) {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "granted") {
      try {
        const notif = new Notification(title, {
          icon: "https://api.dicebear.com/7.x/notionists/svg?seed=AptTalk",
          badge: "https://api.dicebear.com/7.x/notionists/svg?seed=AptTalk",
          ...options,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => notif.close(), 5000);
      } catch (e) {
        console.warn("Desktop notification failed:", e);
      }
    }
  }
}

export const notificationManager = new NotificationManager();
