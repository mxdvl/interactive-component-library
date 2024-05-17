import { Map, MapConfiguration, MapLayers, Projection, Controls } from '.'
import { feature } from 'topojson-client'
import ukCountriesTopo from './sample-data/UK-countries-topo.json'
import styles from './stories.module.css'

const ukCountries = feature(ukCountriesTopo, ukCountriesTopo.objects['countries'])

const meta = {
  title: 'Molecules/Map/Zoomable maps',
  component: Map,
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f6f6f6' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
  argTypes: {
    id: {
      control: 'text',
      description: 'ID applied to the map element',
    },
    width: {
      type: 'number',
      table: { defaultValue: { detail: 'Map scales to size of parent element', summary: 'auto' } },
    },
    height: {
      type: 'number',
      table: { defaultValue: { detail: 'Map scales to size of parent element', summary: 'auto' } },
    },
    config: {
      name: 'config (required)',
      control: 'select',
      description: 'MapConfiguration object',
      options: ['UK Composite', 'England'],
      mapping: { 'UK Composite': MapConfiguration.UKComposite, England: MapConfiguration.England },
    },
    projection: {
      table: { category: 'config' },
      name: 'config.projection',
      description: 'D3 projection function, e.g. d3.geoAlbers() (required)',
      control: 'select',
      options: ['GeoAlbers UK composite', 'GeoAlbers England'],
      mapping: { 'GeoAlbers UK composite': Projection.UKComposite, 'GeoAlbers England': Projection.geoAlbersEngland },
    },
    bounds: {
      table: { category: 'config' },
      defaultValue: 'Default value',
      name: 'config.bounds',
      control: 'object',
      description: 'Visible bounds. The map is scaled and translated to fit these bounds (required)',
    },
    padding: {
      type: 'object',
      table: {
        defaultValue: {
          detail: '{ top: 20, right: 20, bottom: 20, left: 20 }',
          summary: '20px',
        },
      },
    },
  },
  decorators: [
    (Story, { viewMode }) => (
      <>
        <div className={styles[`context-${viewMode}`]}>
          <Story />
        </div>
      </>
    ),
  ],
}

export const UKMap = {
  name: 'UK outline',
  args: {
    id: 'map',
    config: {
      ...MapConfiguration.UKComposite,
      drawToCanvas: true,
    },
    zoom: {
      enabled: true
    }
  },
  render: (args) => (
    <Map {...args}>
      <MapLayers.Polygon features={[ukCountries]} fill="#707070" />
      <Controls.Zoom />
    </Map>
  ),
}

export default meta