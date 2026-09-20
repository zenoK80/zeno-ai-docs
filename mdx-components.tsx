import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs'
import {
  Banner,
  Bleed,
  Button,
  Callout,
  Cards,
  Collapse,
  FileTree,
  ImageZoom,
  Playground,
  Popup,
  Search,
  Select,
  Steps,
  Table,
} from 'nextra/components'
import { AbcScore } from './app/components/abc-score'
import { CodePlayground } from './app/components/code-playground'
import { ConceptFlow } from './app/components/concept-flow'
import { DataBarChart } from './app/components/data-bar-chart'
import { DocsBreadcrumb } from './app/components/docs-breadcrumb'
import { DocsTab, DocsTabs } from './app/components/docs-tabs'
import { HomeLanding } from './app/components/home-landing'
import { OneDriveVideo } from './app/components/one-drive-video'
import { Quiz } from './app/components/quiz'
import { SetDiagram } from './app/components/set-diagram'

const themeComponents = getThemeComponents()
const ThemeWrapper = themeComponents.wrapper
const Tabs = Object.assign((props: Parameters<typeof DocsTabs>[0]) => {
  return <DocsTabs {...props} />
}, {
  Tab: DocsTab,
})

export function useMDXComponents(components = {}) {
  return {
    ...themeComponents,
    AbcScore,
    Banner,
    Bleed,
    Button,
    Callout,
    Cards,
    CodePlayground,
    Collapse,
    ConceptFlow,
    DataBarChart,
    FileTree,
    HomeLanding,
    OneDriveVideo,
    ImageZoom,
    Playground,
    Popup,
    Quiz,
    Search,
    Select,
    SetDiagram,
    Steps,
    Table,
    Tabs,
    'Tabs.Tab': Tabs.Tab,
    wrapper: (props: Parameters<typeof ThemeWrapper>[0]) => (
      <ThemeWrapper {...props}>
        <DocsBreadcrumb />
        {props.children}
      </ThemeWrapper>
    ),
    ...components,
  }
}