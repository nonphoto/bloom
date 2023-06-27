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
} from 'solid-start'
import '@nonphoto/css/reset.css'
import './root.css'
import Header from './components/Header'
import { Quad2d } from '@chloranthy/animation'

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      quad: Quad2d.Type | undefined
      borderRadius: number | undefined
    }
  }
}

export default function Root() {
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
            <Header />
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
