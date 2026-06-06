import { useState, useRef, useEffect } from "react";
import { getVideoUploadParams, submitVideoAnswer } from "../services/interviewService";

/* max recording duration in seconds */
const MAX_DURATION = 120;

/* main VideoRecorder component */
export default function VideoRecorder({ sessionId, questionIndex, onSubmitted, disabled }) {
  /* ui state machine */
  const [phase, setPhase]             = useState("idle");
  const [elapsed, setElapsed]         = useState(0);
  const [uploadProgress, setProgress] = useState(0);
  const [error, setError]             = useState("");

  const videoRef    = useRef(null);
  const streamRef   = useRef(null);
  const recorderRef = useRef(null);
  const timerRef    = useRef(null);
  const chunksRef   = useRef([]);

  /* cleanup camera stream */
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [questionIndex]);

  /* helper :stop all camera and mic tracks */
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    clearInterval(timerRef.current);
  };

  /* step 1 :request camera and mic permissions */
  const handleEnableCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current          = stream;
      videoRef.current.srcObject = stream;
      setPhase("ready");
    } catch (e) {
      setError("camera or microphone access was denied. please allow access and try again.");
    }
  };

  /* step 2 :start recording */
  const handleStartRecording = () => {
    chunksRef.current = [];
    setElapsed(0);

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp8,opus"
    });
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      await handleUploadAndSubmit(blob);
    };

    recorder.start(250);
    setPhase("recording");

    /* auto-stop timer */
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= MAX_DURATION) {
          handleStopRecording();
          return MAX_DURATION;
        }
        return prev + 1;
      });
    }, 1000);
  };

  /* step 3 :stop recording */
  const handleStopRecording = () => {
    clearInterval(timerRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    stopStream();
    setPhase("uploading");
  };

  /* step 4 :upload blob to cloudinary */
  const handleUploadAndSubmit = async (blob) => {
    setError("");
    try {
      /* step 4a :get signed params from our backend */
      const paramsRes  = await getVideoUploadParams(sessionId, questionIndex);
      const { uploadParams } = paramsRes;

      /* step 4b :build the multipart form for cloudinary */
      const form = new FormData();
      form.append("file",       blob);
      form.append("public_id",  uploadParams.publicId);
      form.append("timestamp",  uploadParams.timestamp);
      form.append("signature",  uploadParams.signature);
      form.append("api_key",    uploadParams.apiKey);

      /* step 4c :upload to cloudinary */
      const cloudinaryUrl = await uploadToCloudinary(form, uploadParams.uploadUrl, setProgress);

      /* step 5 :hand the url off to backend */
      setPhase("evaluating");
      const result = await submitVideoAnswer({ sessionId, questionIndex, videoUrl: cloudinaryUrl });

      /* step 6 :notify the parent component */
      onSubmitted(result.evaluation, result.transcript);

    } catch (e) {
      console.error("VideoRecorder upload error :", e);
      setError("upload failed. please try again.");
      setPhase("ready");
    }
  };

  /* helper :xhr upload to cloudinary */
  const uploadToCloudinary = (form, url, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res.secure_url);
        } catch {
          reject(new Error("cloudinary response parse error"));
        }
      };
      xhr.onerror = () => reject(new Error("cloudinary upload network error"));
      xhr.send(form);
    });
  };

  /* format elapsed seconds as mm:ss */
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  const progressPct = Math.round((elapsed / MAX_DURATION) * 100);

  return (
    <div
      className="ip-card"
      style={{ overflow: "hidden" }}
    >
      {/* idle state */}
      {phase === "idle" && (
        <div className="ip-card-body flex flex-col items-center justify-center gap-4 py-10">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
          >
            📹
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>
              Video Answer
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              record yourself speaking your answer — max 2 minutes
            </div>
          </div>
          {error && (
            <div
              className="text-xs px-3 py-2 rounded text-center"
              style={{ background: "var(--color-danger-bg)", color: "var(--color-danger-text)", border: "1px solid var(--color-danger-border)" }}
            >
              {error}
            </div>
          )}
          <button
            onClick={handleEnableCamera}
            disabled={disabled}
            className="btn-primary px-5 py-2 text-sm"
          >
            Enable Camera &amp; Mic
          </button>
        </div>
      )}

      {/* ready state */}
      {(phase === "ready" || phase === "recording") && (
        <div>
          {/* live camera preview */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              maxHeight: 280,
              objectFit: "cover",
              display: "block",
              background: "#000",
              borderRadius: "var(--radius-md) var(--radius-md) 0 0"
            }}
          />

          <div className="ip-card-body flex flex-col gap-3">
            {/* recording timer and progress bar */}
            {phase === "recording" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: "#ef4444" }}>
                    {/* pulsing red recording indicator dot */}
                    <span
                      style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "#ef4444", display: "inline-block",
                        animation: "pulseGlow 1.2s ease-in-out infinite"
                      }}
                    />
                    REC {formatTime(elapsed)} / {formatTime(MAX_DURATION)}
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {MAX_DURATION - elapsed}s remaining
                  </span>
                </div>

                {/* timer progress bar */}
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: 4, background: "var(--bg-subtle)" }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progressPct}%`,
                      background: "var(--accent)",
                      transition: "width 1s linear"
                    }}
                  />
                </div>
              </div>
            )}

            {phase === "ready" && (
              <div className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                max 2:00 · speak clearly into your microphone
              </div>
            )}

            {error && (
              <div
                className="text-xs px-3 py-2 rounded"
                style={{ background: "var(--color-danger-bg)", color: "var(--color-danger-text)" }}
              >
                {error}
              </div>
            )}

            {/* action buttons */}
            {phase === "ready" && (
              <button
                onClick={handleStartRecording}
                disabled={disabled}
                className="btn-primary w-full py-2.5 text-sm"
              >
                ● Start Recording
              </button>
            )}
            {phase === "recording" && (
              <button
                onClick={handleStopRecording}
                className="w-full py-2.5 text-sm font-semibold rounded-lg transition-all"
                style={{ background: "#ef4444", color: "#fff", border: "none", cursor: "pointer" }}
              >
                ⏹ Stop &amp; Submit
              </button>
            )}
          </div>
        </div>
      )}

      {/* uploading state */}
      {phase === "uploading" && (
        <div className="ip-card-body flex flex-col items-center gap-4 py-10">
          <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Uploading video... {uploadProgress}%
          </div>
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: 6, background: "var(--bg-subtle)" }}
          >
            <div
              style={{
                height: "100%",
                width: `${uploadProgress}%`,
                background: "var(--accent)",
                transition: "width 0.3s ease"
              }}
            />
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            do not close this tab
          </div>
        </div>
      )}

      {/* evaluating state */}
      {phase === "evaluating" && (
        <div className="ip-card-body flex flex-col items-center gap-3 py-10">
          <div className="ip-spinner ip-spinner-dark" />
          <div className="text-sm font-semibold mt-2" style={{ color: "var(--text)" }}>
            Transcribing your answer...
          </div>
          <div className="text-xs text-center max-w-xs" style={{ color: "var(--text-muted)" }}>
            ai is transcribing your speech and evaluating both your content and communication quality
          </div>
        </div>
      )}
    </div>
  );
}
