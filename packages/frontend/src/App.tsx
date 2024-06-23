import { FC, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar } from './components/TopBar'
import { Providers } from './providers/Providers'
import { useLocale, useSettings } from './state/stores'

const App: FC = () => {
  const { lang } = useSettings()
  const { setDefaultLang } = useLocale()

  useEffect(() => {
    setDefaultLang(lang)
  }, [lang])

  return (
    <Providers>
      <TopBar />
      <Outlet />
    </Providers>
  )
}

export default App
