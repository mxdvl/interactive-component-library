import { BlockResults } from '.'

export default {
  title: 'Molecules/BlockResults',
  component: BlockResults,
}

export const Default = {
  args: {
    blockName: 'Left',
    parties: [{ name: 'Party 1' }, { name: 'Party 2' }],
  },
}
