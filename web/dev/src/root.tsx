// @refresh reload
import { Suspense } from 'solid-js'
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
  useLocation,
  useNavigate,
} from 'solid-start'
import '@nonphoto/css/reset.css'
import './root.css'
import Header from './components/Header'

export default function Root() {
  const options = Object.keys(import.meta.glob('./routes/examples/*.tsx'))
    .map(path => path.match(/^\.\/routes\/examples\/(.+)\.tsx$/)?.[1])
    .filter((routeName): routeName is string => typeof routeName === 'string')
    .map(routeName => ({
      value: `/examples/${routeName}`,
      label: routeName,
    }))

  const navigate = useNavigate()

  const location = useLocation()

  return (
    <Html lang="en">
      <Head>
        <Title>Chloranthy</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <Header options={options} value={location.pathname} onValue={navigate} />
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  )
}
