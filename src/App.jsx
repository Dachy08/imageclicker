"use client"

import { useState, useEffect, useRef } from "react"
import "./App.css"

function App() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const imageRef = useRef(null)

  // Chromebook data with the provided image URLs
  const chromebooks = [
    {
      id: 1,
      image:
        "https://cdn.thewirecutter.com/wp-content/media/2024/09/chromebooks-2048px-6611.jpg?auto=webp&quality=75&width=1024",
      name: "Lenovo Chromebook",
      description: "Sleek design with premium features and performance",
    },
    {
      id: 2,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuLAigM1p3NYKyWxncmUxlkBQ6hBVfXgUQuA&s",
      name: "Acer Chromebook",
      description: "Compact and portable with excellent battery life",
    },
    {
      id: 3,
      image:
        "https://www.hp.com/content/dam/sites/worldwide/personal-computers/consumer/chrome/chromebooks/new_version_v1/hp-chromebook-14-modern-gray@2x.png",
      name: "HP Chromebook 14",
      description: "Modern design with a 14-inch display and reliable performance",
    },
    {
      id: 4,
      image:
        "https://sjc.microlink.io/Ar5BJNPY4DPsgJrdrDG5Em03ldLWuIJaM2Fn7qbCs2zX7jPiJkcec_p1wc7vH2HpwTpJOUq6iklegf_CpZLbyg.jpeg",
      name: "Samsung Galaxy Chromebook",
      description: "Premium ultrabook with vibrant AMOLED display",
    },
  ]

  // Preload images for smoother experience
  useEffect(() => {
    const preloadImages = async () => {
      try {
        const imagePromises = chromebooks.map((chromebook) => {
          return new Promise((resolve, reject) => {
            const img = new Image()
            img.src = chromebook.image
            img.onload = resolve
            img.onerror = reject
          })
        })

        await Promise.all(imagePromises)
        setImagesLoaded(true)
      } catch (error) {
        console.error("Failed to load some images", error)
        // Still set as loaded even if some fail
        setImagesLoaded(true)
      }
    }

    preloadImages()
  }, [])

  // Function to navigate to next image
  const nextImage = () => {
    if (!isZoomed) {
      setSelectedImage((prev) => (prev === chromebooks.length - 1 ? 0 : prev + 1))
    }
  }

  // Function to navigate to previous image
  const prevImage = () => {
    if (!isZoomed) {
      setSelectedImage((prev) => (prev === 0 ? chromebooks.length - 1 : prev - 1))
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        nextImage()
      } else if (e.key === "ArrowLeft") {
        prevImage()
      } else if (e.key === "Escape" && isZoomed) {
        setIsZoomed(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isZoomed])

  // Handle zoom toggle
  const toggleZoom = (e) => {
    if (isZoomed) {
      setIsZoomed(false)
    } else {
      setIsZoomed(true)
      updateZoomPosition(e)
    }
  }

  // Update zoom position based on mouse coordinates
  const updateZoomPosition = (e) => {
    if (!imageRef.current) return

    const { left, top, width, height } = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    setZoomPosition({ x, y })
  }

  // Handle mouse move for zoom position
  const handleMouseMove = (e) => {
    if (isZoomed) {
      updateZoomPosition(e)
    }
  }

  // Handle touch events for mobile
  const handleTouchMove = (e) => {
    if (isZoomed && e.touches && e.touches[0]) {
      const touch = e.touches[0]
      updateZoomPosition({
        clientX: touch.clientX,
        clientY: touch.clientY,
      })
      e.preventDefault() // Prevent scrolling while zoomed
    }
  }

  return (
    <div className="product-container">
      <div className="product-gallery">
        {!imagesLoaded && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading images...</p>
          </div>
        )}

        <div
          className={`main-image-container ${isZoomed ? "zoomed" : ""} ${imagesLoaded ? "loaded" : "loading"}`}
          onClick={toggleZoom}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
        >
          <img
            ref={imageRef}
            src={chromebooks[selectedImage].image || "/placeholder.svg"}
            alt={chromebooks[selectedImage].name}
            className="main-image"
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : {}
            }
          />

          {imagesLoaded && !isZoomed && (
            <>
              {/* Navigation arrows - only show when not zoomed */}
              <button
                className="nav-arrow left-arrow"
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                aria-label="Previous image"
              >
                &lt;
              </button>
              <button
                className="nav-arrow right-arrow"
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                aria-label="Next image"
              >
                &gt;
              </button>

              {/* Image counter - only show when not zoomed */}
              <div className="image-counter">
                {selectedImage + 1} / {chromebooks.length}
              </div>

              {/* Zoom hint */}
              <div className="zoom-hint">Click to zoom</div>
            </>
          )}

          {isZoomed && (
            <div className="zoom-controls">
              <button
                className="zoom-close"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsZoomed(false)
                }}
                aria-label="Close zoom view"
              >
                ✕
              </button>
              <div className="zoom-instruction">
                {window.matchMedia("(pointer: fine)").matches
                  ? "Move mouse to pan • Press ESC to exit"
                  : "Move finger to pan • Tap to exit"}
              </div>
            </div>
          )}
        </div>

        {/* Only show info and thumbnails when not zoomed and images are loaded */}
        {!isZoomed && imagesLoaded && (
          <>
            {/* Chromebook info */}
            <div className="chromebook-info">
              <h2>{chromebooks[selectedImage].name}</h2>
              <p>{chromebooks[selectedImage].description}</p>
            </div>

            <div className="thumbnails">
              {chromebooks.map((chromebook, index) => (
                <div
                  key={index}
                  className={`thumbnail ${selectedImage === index ? "active" : ""}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={chromebook.image || "/placeholder.svg"} alt={chromebook.name} loading="lazy" />
                </div>
              ))}
            </div>

            <div className="keyboard-hint">
              {window.matchMedia("(pointer: fine)").matches
                ? "Use left and right arrow keys to navigate between images"
                : "Swipe or tap arrows to navigate between images"}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
