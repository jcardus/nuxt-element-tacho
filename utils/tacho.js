function convertStatus (status) {
  if (status === 0) {
    return 'Pending'
  }
  if (status === 1) {
    return 'Processing'
  }
  if (status === 2) {
    return 'Done'
  }
  return status
}

function getEntityName (entityid, type, devices, drivers) {
  if (type === 'V') {
    const device = devices.find(d => d.id === entityid)
    return device ? device.name : entityid
  } else {
    const driver = drivers.find(d => d.id === entityid)
    return driver ? driver.name : entityid
  }
}

async function getTachoStatus (store, tacho) {
  const lastTachoDownloads = await tacho.getLast()
  store.commit('setLastTachoDownloads', lastTachoDownloads)

  const lastTachoConnectionStatus = await tacho.getTachoConnectionStatus()
  store.commit('setTachoConnectionStatus', lastTachoConnectionStatus)

  const tachoDownloads = await tacho.get()
  store.commit('setTachoDownloads', tachoDownloads)

  const statusDate = await tacho.getStatus()
  if (statusDate) {
    store.commit('setTachoLastUpdate', new Date(statusDate.lastupdate))
  }
}

exports.convertStatus = convertStatus
exports.getEntityName = getEntityName
exports.getTachoStatus = getTachoStatus
