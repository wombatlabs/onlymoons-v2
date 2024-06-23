import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const OnlyMoonsTokenModule = buildModule('OnlyMoonsTokenModule', (m) => {
  const onlyMoonsToken = m.contract('OnlyMoons')

  return { onlyMoonsToken }
})

export default OnlyMoonsTokenModule
