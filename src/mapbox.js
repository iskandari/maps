import React, {
  createContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
} from 'react'
import mapboxgl from 'mapbox-gl'

export const MapboxContext = createContext(null)

export const useMapbox = () => {
  return useContext(MapboxContext)
}

const Mapbox = ({
  glyphs,
  style,
  viewState, // Accept viewState
  center,
  zoom,
  minZoom,
  maxZoom,
  maxBounds,
  debug,
  children,
  mapRef,
  onMove,
  onMoveStart,
  onMoveEnd,
  onViewStateChange,
}) => {
  const map = useRef(null)
  const [ready, setReady] = useState(false)

  // Refs to store event handler functions for cleanup
  const onViewStateChangeHandlerRef = useRef(null)

  // Initialize the map instance
  const initializeMap = useCallback(
    (node) => {
      if (node !== null && !map.current) {
        const mapboxStyle = { version: 8, sources: {}, layers: [] }
        if (glyphs) {
          mapboxStyle.glyphs = glyphs
        }

        if (!viewState) {
          console.error('viewState is undefined in Mapbox component');
          return null; // or render a fallback UI
        }

        const { longitude, latitude, zoom, bearing, pitch } = viewState

        map.current = new mapboxgl.Map({
          container: node,
          style: mapboxStyle,
          center: [longitude, latitude],
          zoom: zoom,
          bearing: bearing,
          pitch: pitch,
          minZoom: minZoom,
          maxZoom: maxZoom,
          maxBounds: maxBounds,
          dragRotate: false,
          pitchWithRotate: false,
          touchZoomRotate: true,
        })

        // Disable unwanted interactions
        map.current.touchZoomRotate.disableRotation()
        map.current.touchPitch.disable()

        // Set debug options
        map.current.showTileBoundaries = debug

        // Expose the map instance via mapRef
        if (mapRef) {
          mapRef.current = map.current
        }

        // Set up event listeners
        if (onMove) {
          map.current.on('move', onMove)
        }
        if (onMoveStart) {
          map.current.on('movestart', onMoveStart)
        }
        if (onMoveEnd) {
          map.current.on('moveend', onMoveEnd)
        }
        if (onViewStateChange) {
          const handler = () => {
            const { lng, lat } = map.current.getCenter()
            const zoom = map.current.getZoom()
            const bearing = map.current.getBearing()
            const pitch = map.current.getPitch()
            onViewStateChange({
              longitude: lng,
              latitude: lat,
              zoom,
              bearing,
              pitch,
            })
          }
          map.current.on('move', handler)
          onViewStateChangeHandlerRef.current = handler
        }

        map.current.on('styledata', () => {
          setReady(true)
        })
      }
    },
    [
      glyphs,
      center,
      zoom,
      minZoom,
      maxZoom,
      maxBounds,
      debug,
      mapRef,
      onMove,
      onMoveStart,
      onMoveEnd,
      onViewStateChange,
      viewState, // Add viewState to dependencies
    ]
  )

    // Update the map when viewState changes
    useEffect(() => {
      if (map.current && viewState) {
        const { longitude, latitude, zoom, bearing, pitch } = viewState
        map.current.jumpTo({
          center: [longitude, latitude],
          zoom: zoom,
          bearing: bearing,
          pitch: pitch,
        })
      }
    }, [viewState])
    
  useEffect(() => {
    return () => {
      if (map.current) {
        // Remove event listeners
        if (onMove) {
          map.current.off('move', onMove)
        }
        if (onMoveStart) {
          map.current.off('movestart', onMoveStart)
        }
        if (onMoveEnd) {
          map.current.off('moveend', onMoveEnd)
        }
        if (onViewStateChange && onViewStateChangeHandlerRef.current) {
          map.current.off('move', onViewStateChangeHandlerRef.current)
          onViewStateChangeHandlerRef.current = null
        }

        // Remove the map instance
        map.current.remove()
        map.current = null
        setReady(false)
      }
    }
  }, [onMove, onMoveStart, onMoveEnd, onViewStateChange])

  // Update debug settings if `debug` prop changes
  useEffect(() => {
    if (map.current) {
      map.current.showTileBoundaries = debug
    }
  }, [debug])

  return (
    <MapboxContext.Provider value={{ map: map.current }}>
      <div
        style={{
          top: '0px',
          bottom: '0px',
          position: 'absolute',
          width: '100%',
          ...style,
        }}
        ref={initializeMap}
      />
      {ready && children}
    </MapboxContext.Provider>
  )
}

export default Mapbox
