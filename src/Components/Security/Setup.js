import { DeleteForever, Lock } from '@material-ui/icons'
import React, { useState } from 'react'
import './Security.css'
import List from './List'
import * as store from '../../Stores/Secret'
import Pin from './Pin'

const Setup = ({ pinStatus, onUpdatePinStatus}) => {
  const [status, setSecurityStatus] = useState(store.securityStatus.getVal())
  const [warn, setWarn] = useState()
  const [pin, setPin] = useState(store.pin.getVal() || '')
  const [list, setList] = useState(store.chatList.getVal() || [])
  const [openList, setOpenList] = useState(false)

  const saveSettings = () => {
    if (!/\d{4,}/.test(pin) ) {
      setWarn('PIN меньше 4 цифр')
      return false
    }
    store.chatList.setVal(list)
    store.pin.setVal(pin)

    setWarn(`настройки сохранены\nчаты: ${list.length}, PIN: ${pin}`)
    return true
  }
  const changeStatus = () => {
    if (status === 'enabled') {
      store.securityStatus.setVal('off')
      setSecurityStatus(store.securityStatus.getVal())
      setWarn('PIN Off')
    } else if (saveSettings()) {
      store.securityStatus.setVal('enabled')
      setSecurityStatus(store.securityStatus.getVal())
      setWarn(`PIN On: ${pin}`)
    }
  }
  const enabled = status === 'enabled'

  if (enabled && !pinStatus) {
    return <Pin onUpdatePinStatus={onUpdatePinStatus} pin={pin} list={list} />
  }

  if (openList) {
    return <List setOpenList={setOpenList} setList={setList} list={list}/>
  }


  return (
    <div className='security_root'>
      <div className='security_setup_row'>
        Setup
      </div>
      <div onClick={changeStatus} className={`security_setup_row ${enabled? 'security_enabled' : 'security_disabled'}`}>
        <div> {enabled ? 'Выключить Пинкод' : 'Включить Пинкод' } </div>
        <div>{enabled ? <DeleteForever/> : null}</div>
      </div>
      <div className='security_setup_row'>
        PIN:
        <input className='security_setup_pin' value={pin} onChange={e => setPin(e.target.value)} type="text"/>
      </div>
      <div className='security_setup_row' onClick={() => setOpenList(true)}>
        <div>Настроить чаты</div>
        <div>{list.length}</div>
      </div>
      <div className='security_setup_row' onClick={saveSettings}>
        Сохранить настройки
      </div>
      {
        enabled && (
          <div className='security_setup_row' onClick={() => onUpdatePinStatus(null)}>
            <div>Перейти на пин</div>
            <Lock />
          </div>
        )
      }
      { warn && <div className='security_warn'><pre>{warn}</pre></div> }
    </div>
  )
}
export default Setup
