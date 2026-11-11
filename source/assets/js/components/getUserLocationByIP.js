export default async function getUserLocationByIP() {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`) // eslint-disable-line no-console
    }

    const data = await response.json()

    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
    }
  } catch (error) {
    // Es
    console.error('Error fetching IP location:', error) // eslint-disable-line no-console
    return null
  }
}
