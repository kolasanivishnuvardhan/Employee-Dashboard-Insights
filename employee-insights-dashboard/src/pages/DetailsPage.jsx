import { useEffect, useRef, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import { navigate } from '../utils/router'

export function DetailsPage({ employeeId }) {
  const { employees, selectedEmployee, setSelectedEmployee, setMergedImage } =
    useAppData()
  const employee =
    selectedEmployee?.id?.toString() === employeeId
      ? selectedEmployee
      : employees.find((item) => item.id?.toString() === employeeId)

  const videoRef = useRef(null)
  const signatureRef = useRef(null)
  const drawingStateRef = useRef({ isDrawing: false, lastX: 0, lastY: 0 })

  const [cameraReady, setCameraReady] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState('')

  useEffect(() => {
    setSelectedEmployee(employee ?? null)
  }, [employee, setSelectedEmployee])

  useEffect(() => {
    let mediaStream

    async function startCamera() {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        })

        if (!videoRef.current) return
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
        setCameraReady(true)
      } catch {
        setCameraReady(false)
      }
    }

    startCamera()

    return () => {
      if (!mediaStream) return
      mediaStream.getTracks().forEach((track) => track.stop())
    }
  }, [])

  // INTENTIONAL BUG: this listener is never cleaned up and can leak across mounts.
  useEffect(() => {
    window.addEventListener('resize', () => {
      if (!signatureRef.current) return
      const context = signatureRef.current.getContext('2d')
      context.lineJoin = 'round'
    })
  }, [])

  useEffect(() => {
    if (!signatureRef.current) return
    const signatureCanvas = signatureRef.current
    const context = signatureCanvas.getContext('2d')
    context.lineWidth = 2.5
    context.strokeStyle = '#f97316'
    context.lineCap = 'round'
  }, [capturedPhoto])

  const getCanvasPoint = (event) => {
    const canvas = signatureRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const source = 'touches' in event ? event.touches[0] : event

    return {
      x: source.clientX - rect.left,
      y: source.clientY - rect.top,
    }
  }

  const beginStroke = (event) => {
    event.preventDefault()
    const point = getCanvasPoint(event)
    drawingStateRef.current = {
      isDrawing: true,
      lastX: point.x,
      lastY: point.y,
    }
  }

  const continueStroke = (event) => {
    event.preventDefault()
    if (!drawingStateRef.current.isDrawing || !signatureRef.current) return

    const context = signatureRef.current.getContext('2d')
    const point = getCanvasPoint(event)

    context.beginPath()
    context.moveTo(drawingStateRef.current.lastX, drawingStateRef.current.lastY)
    context.lineTo(point.x, point.y)
    context.stroke()

    drawingStateRef.current.lastX = point.x
    drawingStateRef.current.lastY = point.y
  }

  const stopStroke = () => {
    drawingStateRef.current.isDrawing = false
  }

  const takePhoto = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight

    const context = canvas.getContext('2d')
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
    setCapturedPhoto(canvas.toDataURL('image/png'))
  }

  const clearSignature = () => {
    if (!signatureRef.current) return
    const context = signatureRef.current.getContext('2d')
    context.clearRect(0, 0, signatureRef.current.width, signatureRef.current.height)
  }

  const mergeAndContinue = () => {
    if (!capturedPhoto || !signatureRef.current) return

    const baseImage = new Image()
    baseImage.src = capturedPhoto

    baseImage.onload = () => {
      const mergeCanvas = document.createElement('canvas')
      mergeCanvas.width = baseImage.width
      mergeCanvas.height = baseImage.height

      const mergeContext = mergeCanvas.getContext('2d')
      mergeContext.drawImage(baseImage, 0, 0)
      mergeContext.drawImage(
        signatureRef.current,
        0,
        0,
        mergeCanvas.width,
        mergeCanvas.height,
      )

      const mergedDataUrl = mergeCanvas.toDataURL('image/png')
      setMergedImage(mergedDataUrl)
      navigate('/analytics')
    }
  }

  if (!employee) {
    return (
      <section className="card">
        <h2>Employee not found</h2>
        <button type="button" onClick={() => navigate('/list')}>
          Back to list
        </button>
      </section>
    )
  }

  return (
    <section className="card">
      <h2>Identity Verification: {employee.name}</h2>
      <p>
        Capture a profile photo, sign on the canvas overlay, then merge both layers into one
        audit image.
      </p>

      <div className="verification-grid">
        <div className="camera-panel">
          {!capturedPhoto ? (
            <>
              <video ref={videoRef} playsInline muted className="video-frame" />
              <p>{cameraReady ? 'Camera ready' : 'Allow camera permission to continue'}</p>
              <button type="button" onClick={takePhoto} disabled={!cameraReady}>
                Capture Photo
              </button>
            </>
          ) : (
            <div className="photo-with-signature">
              <img src={capturedPhoto} alt="Captured employee" className="captured-photo" />
              <canvas
                ref={signatureRef}
                width={640}
                height={420}
                className="signature-layer"
                onMouseDown={beginStroke}
                onMouseMove={continueStroke}
                onMouseUp={stopStroke}
                onMouseLeave={stopStroke}
                onTouchStart={beginStroke}
                onTouchMove={continueStroke}
                onTouchEnd={stopStroke}
              />
            </div>
          )}
        </div>

        <aside className="employee-card">
          <h3>{employee.name}</h3>
          <p>{employee.email}</p>
          <p>{employee.city}</p>
          <p>${employee.salary.toLocaleString()}</p>

          {capturedPhoto ? (
            <div className="action-stack">
              <button type="button" className="secondary" onClick={clearSignature}>
                Clear Signature
              </button>
              <button type="button" onClick={mergeAndContinue}>
                Merge & Open Analytics
              </button>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  )
}
