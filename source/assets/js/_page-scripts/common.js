import { qS } from '../functions/selectElement.js'
import getUserLocationByIP from '../components/getUserLocationByIP.js'

const regionBlock = qS('.js-region')

document.addEventListener('DOMContentLoaded', async () => {
  // call hamburger menu show/hide module
  const locationData = await getUserLocationByIP()

  if (locationData) {
    regionBlock.textContent = locationData.region
  }
})
