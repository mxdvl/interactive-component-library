import { Map, Projection, GeoJSON, VectorLayer } from "."
import { feature } from "topojson-client"
import westminsterConstituenciesTopo from "./sample-data/UK-constituencies-simplified-topo.json"

const meta = {
  title: "Molecules/CanvasMap",
  component: Map,
  parameters: {
    viewport: {
      defaultViewport: "reset",
    },
  },
}

export default meta

export const Default = {
  args: {
    config: {
      view: {
        projection: Projection.geoAlbersUKComposite,
        extent: [
          [-8.642194417322951, 49.88234469492934],
          [1.7683086664999994, 60.8456995072],
        ],
        minZoom: 8,
        maxZoom: 14,
        padding: { top: 20, right: 20, bottom: 20, left: 20 },
      },
    },
  },
  render: (args) => {
    const constituencies = feature(westminsterConstituenciesTopo, westminsterConstituenciesTopo.objects["UK-constituencies"])
    const source = new GeoJSON(constituencies)
    const vectorLayer = new VectorLayer({ source })
    return (
      <div style={{ height: "80vh" }}>
        <Map {...args}>
          {{
            controls: [],
            layers: [vectorLayer],
          }}
        </Map>
      </div>
    )
  },
}
