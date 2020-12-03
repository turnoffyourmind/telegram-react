class StorageVal {
  constructor(key) {
    this.key = key
    this.readed = false
    this.value = null
  }

  getVal() {
    if (!this.readed) {
      this.value = JSON.parse(localStorage.getItem(this.key))
      this.readed = true
    }
    return this.value
  }
  setVal (value) {
    this.value = value
    localStorage.setItem(this.key, JSON.stringify(this.value))
  }
}

export const securityStatus = new StorageVal('securityStatus')
export const pin = new StorageVal('pin')
export const chatList = new StorageVal('chatList')
