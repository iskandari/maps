import React from 'react'
import Mapbox from './mapbox'
import Regl from './regl'
import { RegionProvider } from './region/context'
import { LoadingProvider, LoadingUpdater } from './loading'

const Map = ({
  id,
  tabIndex,
  className,
  style,
  zoom,
  minZoom,
  maxZoom,
  maxBounds,
  center,
  debug,
  extensions,
  glyphs,
  children,
  /** Tracks *any* pending requests made by containing `Raster` layers */
  setLoading,
  /** Tracks any metadata and coordinate requests made on initialization by containing `Raster` layers */
  setMetadataLoading,
  /** Tracks any requests of new chunks by containing `Raster` layers */
  setChunkLoading,
  mapRef, // Add this line
  onMove,
  onMoveStart,
  onMoveEnd,
  onViewStateChange,
}) => {
  return (
    <div
      id={id}
      tabIndex={tabIndex}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...style,
      }}
    >
      <Mapbox
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        maxBounds={maxBounds}
        center={center}
        bearing={bearing}
        pitch={pitch}
        debug={debug}
        glyphs={glyphs}
        style={{ position: 'absolute' }}
        mapRef={mapRef} // Pass mapRef to Mapbox
        onMove={onMove} // Forward event handlers
        onMoveStart={onMoveStart}
        onMoveEnd={onMoveEnd}
        onViewStateChange={onViewStateChange}
      >
        <Regl
          extensions={extensions}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          <LoadingProvider>
            <LoadingUpdater
              setLoading={setLoading}
              setMetadataLoading={setMetadataLoading}
              setChunkLoading={setChunkLoading}
            />
            <RegionProvider>{children}</RegionProvider>
          </LoadingProvider>
        </Regl>
      </Mapbox>
    </div>
  )
}

export default Map
