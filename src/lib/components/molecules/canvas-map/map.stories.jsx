import { Map, Projection, GeoJSON, VectorSource, VectorLayer } from "."
import { feature, mesh } from "topojson-client"
// import westminsterConstituenciesTopo from "./sample-data/uk-westminster.json"
import westminsterConstituenciesTopo from "./sample-data/uk-westminster-simplified.json"

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
        minZoom: 1,
        maxZoom: 17,
        padding: { top: 20, right: 20, bottom: 20, left: 20 },
      },
    },
  },
  render: (args) => {
    // const constituencies = feature(westminsterConstituenciesTopo, westminsterConstituenciesTopo.objects["uk-westminster"])
    const constituencyBorders = mesh(westminsterConstituenciesTopo, westminsterConstituenciesTopo.objects["uk-westminster"], (a, b) => {
      return a.properties.name !== b.properties.name
    })
    const bordersSource = new VectorSource({ features: new GeoJSON().readFeaturesFromObject(constituencyBorders) })
    const bordersLayer = new VectorLayer({ source: bordersSource })
    return (
      <div style={{ height: "80vh" }}>
        <Map {...args}>
          {{
            controls: [],
            layers: [bordersLayer],
          }}
        </Map>
      </div>
    )
  },
}
