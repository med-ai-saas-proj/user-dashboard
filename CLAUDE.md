

## Auto-generated signatures
<!-- Updated by gen-context.js -->
# Code signatures

## deps
```
src/App.tsx ← routes/playground-chat
src/features/pg-ehr-converter/components/bhxh-envelope-inspector.tsx ← services/bhxh-envelope
src/features/pg-ehr-converter/components/convert-result-panel.tsx ← services/ehr-converter
src/features/pg-ehr-converter/components/converter-form.tsx ← services/bhxh-envelope, services/examples
src/features/api-keys/components/api-key-dialog.tsx ← api-key-save-dialog
src/features/api-keys/components/api-key-table.tsx ← api-key-update-dialog
src/features/api-keys/hooks/use-create-api-key.ts ← services/api-key
src/features/pg-chat/components/ChatContent.tsx ← services/chat, ChatReceiver, ChatSender
src/features/pg-chat/components/ChatReceiver.tsx ← MarkdownCustom
src/features/pg-chat/services/chat.dto.ts ← stream-chat
src/features/pg-chat/services/stream-chat.dto.ts ← chat
src/features/pg-chat/store/chat.store.ts ← services/chat
src/features/pg-ehr-converter/components/batch-panel.tsx ← services/ehr-converter
src/features/pg-ehr-summary/components/ehr-form.tsx ← clinical-progress-section, lab-results-section, medication-section, patient-info-section
src/features/pg-rx-advisor/utils/rx-advisor.utils.ts ← services/rx-advisor
src/lib/streaming/use-stream.ts ← base-stream
```

## changes (last 5 commits — 7 minutes ago)
```
src/App.tsx                                   ~AppRoutes
src/components/sidebar/app-sidebar.tsx        ~AppSidebar
src/features/pg-ehr-converter/components/convert-result-panel.tsx ~ConvertResultPanel
src/features/pg-ehr-converter/components/converter-form.tsx ~ConverterForm
```

## src

### src/App.tsx
```
component PreventScrollReset
component AppRoutes
component App
hook useLocation
hook useRef
hook useEffect
export App
```

### src/components/api-topology.tsx
```
component ApiTopology
hook useNavigate
export ApiNode
export TopologyDef
export ApiTopology
export TOPOLOGIES
```

### src/components/sidebar/app-sidebar.tsx
```
component VeneraLogo
component AppSidebar
hook useTranslation
hook useAuthStore
hook useLocation
hook useState
hook usePinnedFeatures
export AppSidebar
handler onTogglePin
handler onChange
```

### src/config/api-routes.ts
```
export type ApiRoute
export const buildUrl = (endpoint, params?, string | number | boolean>) =>
export const isServiceEndpoint = (url?) =>
```

### src/features/pg-ehr-converter/components/bhxh-envelope-inspector.tsx
```
component BhxhEnvelopeInspector
hook useState
hook useMemo
export BhxhEnvelopeInspector
handler onChange
```

### src/features/pg-ehr-converter/components/convert-result-panel.tsx
```
component ConvertResultPanel
hook useState
export ConvertResultPanel
handler onCount
```

### src/features/pg-ehr-converter/components/converter-form.tsx
```
component ConverterForm
hook useState
hook useRef
hook useMemo
export DetectedFormat
export ConverterForm
handler onChange
handler onKeyDown
handler onClick
```

### src/features/pg-ehr-converter/services/bhxh-envelope.ts
```
export type BhxhTable
export type BhxhDecodedRecord
export const decodeBhxhEnvelope = (xml) =>
export const decodeBhxhEnvelopeByRecord = (xml) =>
export const decodeBhxhEnvelopeToReadable = (xml) =>
```

### src/routes/bhxh-error-codes.tsx
```
hook useState
hook useLocation
hook useRef
hook useEffect
hook useMemo
export BhxhErrorCodesPage
handler onChange
```

### src/routes/bhxh-validator.tsx
```
props ErrorCodeChipProps
hook useState
hook useRef
hook useMemo
export BhxhValidatorPage
handler onCode
handler onSize
handler onChange
handler onClick
handler onDragOver
handler onDrop
```

### src/routes/ehr-converter.tsx
```
hook useState
export EhrConverterPage
handler onConvert
handler onReverseConvert
handler onValidate
handler onTime
handler onBatchConvert
```

### src/routes/ehr-summary.tsx
```
hook useState
hook useRef
export EhrSummaryPage
handler onClick
handler onChange
```

### src/routes/ophth-summary.tsx
```
hook useState
hook useRef
export OphthSummaryPage
handler onChange
handler onClick
```

### src/routes/voice-transcribe.tsx
```
hook useState
hook useRef
hook useEffect
export VoiceTranscribePage
handler onChange
handler onClick
```

### src/components/a2ui-renderer.tsx
```
component RenderComponent
component A2UIRenderer
props A2UIRendererProps
export A2UIRenderer
handler onAction
```

### src/components/demo/demo-empty-state.tsx
```
component DemoEmptyState
props DemoEmptyStateProps
export DemoEmptyState
```

### src/components/demo/demo-page-shell.tsx
```
component DemoPageShell
component DemoPageDescription
component DemoToolbar
component DemoSplitLayout
export DemoPageShell
export DemoPageDescription
export DemoToolbar
export DemoSplitLayout
```

### src/components/raw-response-viewer.tsx
```
component RawResponseViewer
props RawResponseViewerProps
hook useState
export RawResponseViewer
handler onClick
```

### src/components/shadcn/accordion.tsx
```
component Accordion
component AccordionItem
component AccordionTrigger
component AccordionContent
```

### src/components/shadcn/avatar.tsx
```
component Avatar
component AvatarImage
component AvatarFallback
```

### src/components/shadcn/breadcrumb.tsx
```
component Breadcrumb
component BreadcrumbList
component BreadcrumbItem
component BreadcrumbLink
component BreadcrumbPage
component BreadcrumbSeparator
component BreadcrumbEllipsis
```

### src/components/shadcn/button.tsx
```
component Button
handler onVariants
```

### src/components/shadcn/collapsible.tsx
```
component Collapsible
component CollapsibleTrigger
component CollapsibleContent
```

### src/components/shadcn/dialog.tsx
```
component Dialog
component DialogTrigger
component DialogPortal
component DialogClose
component DialogOverlay
component DialogContent
component DialogHeader
component DialogFooter
component DialogTitle
component DialogDescription
```

### src/components/shadcn/dropdown-menu.tsx
```
component DropdownMenu
component DropdownMenuPortal
component DropdownMenuTrigger
component DropdownMenuContent
component DropdownMenuGroup
component DropdownMenuItem
component DropdownMenuCheckboxItem
component DropdownMenuRadioGroup
component DropdownMenuRadioItem
component DropdownMenuLabel
component DropdownMenuSeparator
component DropdownMenuShortcut
component DropdownMenuSub
component DropdownMenuSubTrigger
component DropdownMenuSubContent
```

### src/components/shadcn/field.tsx
```
component FieldSet
component FieldLegend
component FieldGroup
component Field
component FieldContent
component FieldLabel
component FieldTitle
component FieldDescription
component FieldSeparator
component FieldError
hook useMemo
```

### src/components/shadcn/input-copy.tsx
```
hook useCopyToClipboard
export InputCopy
```

### src/components/shadcn/input-group.tsx
```
component InputGroup
component InputGroupAddon
component InputGroupButton
component InputGroupText
component InputGroupInput
component InputGroupTextarea
handler onVariants
handler onClick
```

### src/components/shadcn/input.tsx
```
component Input
```

### src/components/shadcn/label.tsx
```
component Label
```

### src/components/shadcn/separator.tsx
```
component Separator
```

### src/components/shadcn/sheet.tsx
```
component Sheet
component SheetTrigger
component SheetClose
component SheetPortal
component SheetOverlay
component SheetContent
component SheetHeader
component SheetFooter
component SheetTitle
component SheetDescription
```

### src/components/shadcn/sidebar.tsx
```
component SidebarProvider
component Sidebar
component SidebarTrigger
component SidebarRail
component SidebarInset
component SidebarInput
component SidebarHeader
component SidebarFooter
component SidebarSeparator
component SidebarContent
component SidebarGroup
component SidebarGroupLabel
component SidebarGroupAction
component SidebarGroupContent
component SidebarMenu
component SidebarMenuItem
component SidebarMenuButton
component SidebarMenuAction
component SidebarMenuBadge
component SidebarMenuSkeleton
component SidebarMenuSub
component SidebarMenuSubItem
component SidebarMenuSubButton
hook useSidebar
hook useContext
hook useIsMobile
hook useState
hook useCallback
hook useEffect
hook useMemo
handler onOpenChange
handler onClick
handler onVariants
```

### src/components/shadcn/skeleton.tsx
```
component Skeleton
```

### src/components/shadcn/sonner.tsx
```
hook useTheme
```

### src/components/shadcn/spinner.tsx
```
component Spinner
```

### src/components/shadcn/table.tsx
```
component Table
component TableHeader
component TableBody
component TableFooter
component TableRow
component TableHead
component TableCell
component TableCaption
```

### src/components/shadcn/textarea.tsx
```
component Textarea
```

### src/components/shadcn/tooltip.tsx
```
component TooltipProvider
component Tooltip
component TooltipTrigger
component TooltipContent
```

### src/components/sidebar/locale-switcher.tsx
```
hook useTranslation
export LocaleSwitcherProps
```

### src/components/sidebar/nav-main.tsx
```
component NavMain
hook useLocation
export NavMain
```

### src/components/sidebar/nav-projects.tsx
```
component NavItem
component NavProjects
props NavProjectsProps
props NavItemProps
hook useLocation
export NavProjects
handler onClick
handler onTogglePin
```

### src/components/sidebar/nav-user.tsx
```
component NavUser
hook useSidebar
hook useSignOut
export NavUser
```

### src/components/sidebar/team-switcher.tsx
```
component TeamSwitcher
hook useSidebar
hook useState
export TeamSwitcher
```

### src/components/view-code-dialog.tsx
```
component CopyButton
component ApiKeyPicker
component ViewCodeDialog
props ViewCodeDialogProps
hook useState
hook useGetApiKeys
hook useServiceApiKeyStore
hook useEffect
export ViewCodeDialog
handler onInline
handler onClick
handler onSelect
```

### src/enums/stream-chat.enum.ts
```
export type StreamEventType
export type StreamPartType
```

### src/features/api-keys/api-key.type.ts
```
export type APIKey
```

### src/features/api-keys/components/api-key-dialog.tsx
```
hook useTranslation
hook useServiceApiKeyStore
hook useCreateApiKey
hook useState
hook useForm
export APIKeyDialog
handler onSchema
handler onFormData
handler onSubmit
handler onOpenChange
```

### src/features/api-keys/components/api-key-required-dialog.tsx
```
component ApiKeyRequiredDialog
hook useTranslation
export ApiKeyRequiredDialog
handler onOpenChange
```

### src/features/api-keys/components/api-key-save-dialog.tsx
```
component APIKeySaveDialog
hook useTranslation
export APIKeySaveDialog
handler onOpenChange
```

### src/features/api-keys/components/api-key-table.tsx
```
hook useTranslation
hook useDeleteApiKey
hook useState
export APIKeyTable
handler onDeleteApiKey
handler onOpenUpdateAPIKeyDialog
```

### src/features/api-keys/components/api-key-update-dialog.tsx
```
hook useTranslation
hook useUpdateApiKey
hook useForm
export APIKeyUpdateDialog
handler onSubmit
handler onOpenChange
```

### src/features/api-keys/hooks/use-create-api-key.ts
```
export const useCreateApiKey = () =>
```

### src/features/api-keys/hooks/use-delete-api-key.ts
```
export const useDeleteApiKey = () =>
```

### src/features/api-keys/hooks/use-get-api-keys.ts
```
export const useGetApiKeys = () =>
```

### src/features/api-keys/hooks/use-update-api-key.ts
```
export const useUpdateApiKey = () =>
```

### src/features/api-keys/services/api-key.dto.ts
```
export type CreateApiKeyRequest
export type CreateApiKeyResponse
export type UpdateApiKeyRequest
export type ApiKeyOutput
export type GetApiKeyResponse
```

### src/features/api-keys/services/create-api-key.ts
```
export const createApiKey = async (credentials) =>
```

### src/features/api-keys/services/delete-api-key.ts
```
export const deleteApiKey = async (apikeyId) =>
```

### src/features/api-keys/services/update-api-key.ts
```
export const updateApiKey = async (params) =>
```

### src/features/api-keys/store/api-key.store.ts
```
export const useAPIKeyStore = create<APIKeyStore>(...)
```

### src/features/api-keys/store/service-api-key.store.ts
```
export const useServiceApiKeyStore = create<ServiceApiKeyState>(...)
  selectedApiKey
  setSelectedApiKey
  clearSelectedApiKey
```

### src/features/auth/hooks/use-auth-status.ts
```
export const useAuthStatus = () =>
```

### src/features/auth/hooks/use-sign-out.ts
```
export const useSignOut = () =>
```

### src/features/auth/providers/iam-provider.tsx
```
hook useState
hook useAuthStore
hook useCallback
hook useEffect
hook useContext
export IamProvider
```

### src/features/auth/services/sign-out.ts
```
export const signOut = async () =>
```

### src/features/auth/store/auth-store.ts
```
export type UserInfo
export const useAuthStore = create<AuthState>(...)
  token
  refreshToken
  expiresAt
  userInfo
  setAuth
  setToken
  setUserInfo
  logout
  isTokenExpired
```

### src/features/pg-ai-search/services/ai-search.dto.ts
```
export type AISearchRequest
export type AISearchResponse
export type ModelResponseContent
```

### src/features/pg-ai-search/store/ai-search.store.ts
```
export const useAISearchStore = create<AISearchStore>(...)
```

### src/features/pg-chat/components/ChatContent.tsx
```
hook useTranslation
hook useRef
hook useEffect
export ChatContent
```

### src/features/pg-chat/components/ChatInput.tsx
```
hook useTranslation
hook useState
export ChatInput
handler onChange
handler onKeyDown
handler onClick
```

### src/features/pg-chat/components/ChatReceiver.tsx
```
component ChatReceiver
export ChatReceiver
```

### src/features/pg-chat/components/ChatSender.tsx
```
component ChatSender
export ChatSender
```

### src/features/pg-chat/components/MarkdownCustom.tsx
```
component MarkdownCustom
props MarkdownProps
export MarkdownCustom
```

### src/features/pg-chat/services/chat.dto.ts
```
export type ChatMessage
export type ChatRequest
export type EHRChatRequest
export type ModelResponseContent
export type ChatResponse
export type StreamChatMessageParams
```

### src/features/pg-chat/services/sse.ts
```
export async function createSSE({ url, signal, payload, onOpen, onMessage, onError, onClose, }, "token">)
```

### src/features/pg-chat/services/stream-chat.dto.ts
```
export interface StreamEvent
  event: StreamEventType
  data: T
export interface ConversationStartData
  conversation_id: string
export interface FinalResultData
  id: string
  status: "completed" | "error"
  usage: { input_tokens: number
  output_tokens: number
  output: any | null
export interface Citation
  start_index: number
  end_index: number
  reference_type: "document" | "webpage" | "inline_te
  title: string
  src: string
  content: string
export type CreateSSEParams
export type PartDeltaData
export type ChatStreamEvent
export type StartStreamParams
```

### src/features/pg-chat/store/chat.store.ts
```
export const useChatStore = create<ChatStore>(...)
```

### src/features/pg-ehr-converter/components/batch-panel.tsx
```
component BatchPanel
hook useState
hook useRef
export BatchPanel
handler onDrop
handler onDragOver
handler onDragLeave
handler onChange
handler onClick
```

### src/features/pg-ehr-converter/components/document-panel.tsx
```
component DocumentPanel
hook useState
hook useRef
export DocumentPanel
handler onDrop
handler onDragOver
handler onChange
handler onClick
```

### src/features/pg-ehr-converter/services/ehr-converter.dto.ts
```
export type ConvertRequest
export type ConvertResponse
export type ReverseConvertRequest
export type ReverseConvertResponse
export type ValidateRequest
export type ValidateResponse
export type BatchConvertRequest
export type BatchItemResult
export type BatchConvertResponse
export type FhirEntry
```

### src/features/pg-ehr-converter/services/examples.ts
```
export type ExampleData
```

### src/features/pg-ehr-summary/components/clinical-progress-section.tsx
```
component ClinicalProgressSection
hook useTranslation
export ClinicalProgressSection
handler onProps
handler onClick
```

### src/features/pg-ehr-summary/components/ehr-form.tsx
```
component EHRForm
hook useForm
hook useFieldArray
export EHRForm
handler onSubmit
```

### src/features/pg-ehr-summary/components/lab-results-section.tsx
```
component LabResultsSection
hook useTranslation
export LabResultsSection
handler onProps
handler onClick
```

### src/features/pg-ehr-summary/components/medication-section.tsx
```
component MedicationSection
hook useTranslation
export MedicationSection
handler onSectionProps
handler onClick
```

### src/features/pg-ehr-summary/components/patient-info-section.tsx
```
component PatientInfoSection
hook useTranslation
export PatientInfoSection
handler onProps
```

### src/features/pg-ehr-summary/components/summary-response-dialog.tsx
```
component SummaryResponseDialog
hook useCopyToClipboard
hook useTranslation
export SummaryResponseDialog
handler onOpenChange
```

### src/features/pg-ehr-summary/ehr-form.type.ts
```
export type TongHop
export type ChiTietThuoc
export type ChiTietCLS
export type DienBienLamSang
export type EHRFormData
```

### src/features/pg-ehr-summary/schemas/ehr-form.schema.ts
```
export type EHRFormData
```

### src/features/pg-ehr-summary/services/ehr-summary.dto.ts
```
export type EHRSummaryRequest
export type EHRSummaryStreamRequest
export type EHRSummaryResponse
```

### src/features/pg-ehr-summary/utils/ehr-date.utils.ts
```
export function toVnMohDateFormat(dateString) → string
export function toVnMohDateTimeFormat(dateTimeString) → string
```

### src/features/pg-ehr-summary/utils/ehr-summary.utils.ts
```
export const ehrFormToSummaryRequest = (data) =>
export const ehrFormToStreamRequest = (data, model, conversationId?) =>
```

### src/features/pg-rx-advisor/components/analysis-response-dialog.tsx
```
component AnalysisResponseDialog
hook useCopyToClipboard
export AnalysisResponseDialog
handler onOpenChange
handler onClick
```

### src/features/pg-rx-advisor/services/rx-advisor.dto.ts
```
export type RxAdvisorRequest
export type RxChatRequest
export type RxAdvisorStreamRequest
export type ModelResponseContent
export type RxChatResponse
export type UsedTool
export type RxAdvisorResponse
```

### src/features/pg-rx-advisor/utils/rx-advisor.utils.ts
```
export const ehrFormToRxAdvisorRequest = (data) =>
export const ehrFormToRxAdvisorStreamRequest = (data, model, conversationId?) =>
```

### src/hooks/use-copy-to-clipboard.ts
```
export function useCopyToClipboard({ timeout = 2000 } = {}) → { copy, isCopied }
```

### src/hooks/use-mobile.ts
```
export function useIsMobile()
```

### src/hooks/use-pinned-features.ts
```
export function usePinnedFeatures()
```

### src/hooks/use-style-theme.ts
```
export type StyleTheme
export function useStyleTheme()
```

### src/index.css
```
var --radius
var --background
var --foreground
var --card
var --card-foreground
var --popover
var --popover-foreground
var --primary
var --primary-foreground
var --secondary
var --secondary-foreground
var --muted
var --muted-foreground
var --accent
var --accent-foreground
var --destructive
var --border
var --input
var --ring
var --chart-1
var --chart-2
var --chart-3
var --chart-4
var --chart-5
var --sidebar
```

### src/layouts/dashboard-layout.tsx
```
hook useTheme
hook useStyleTheme
export DashboardLayout
handler onClick
```

### src/lib/auth-headers.ts
```
export async function getAuthHeaders(url) → Promise<Record<string, string>
export function handleUnauthorized() → void
```

### src/lib/streaming/base-stream.ts
```
export type BaseStreamRequest
export function useBaseStream()
export function extractTextFromOutput(output) → string
export function extractDelta(event) → string | null
export function extractConversationId(event) → string | null
export function isFinalResult(event) → boolean
export function extractFinalResult(event) → FinalResultData | null
```

### src/lib/streaming/use-stream.ts
```
export type StreamHandlers
export type StreamRequestConfig
export function useStream()
```

### src/lib/utils.ts
```
export function cn(...inputs)
```

### src/lib/webgpu-inference.ts
```
export function getWebGPUState() → WebGPUState
export function isWebGPUSupported() → boolean
export async function loadWebGPUModel(modelId = "onnx-community/Qwen2.5-VL-3B-Instruct", task = "image-text-to-text") → Promise<boolean>
export async function generateText(prompt, options) → Promise<string>
export function unloadModel()
```

### src/routes/a2ui-playground.tsx
```
component A2UIPlaygroundPage
hook useState
hook useEffect
handler onAction
```

### src/routes/api-flow-builder.tsx
```
component ApiFlowBuilderPage
hook useSearchParams
hook useState
hook useCallback
hook useEffect
handler onChange
handler onComp
handler onClick
handler onDragOver
handler onDragEnd
```

### src/routes/api-keys.tsx
```
component APIKeysPage
hook useTranslation
hook useState
hook useGetApiKeys
handler onOpenChange
```

### src/routes/api-reference.tsx
```
component APIReferencePage
hook useTheme
hook useState
```

### src/routes/architecture.tsx
```
component LayerRow
component ConnectorArrow
component MermaidRenderer
component MermaidView
component StatPill
component ArchitecturePage
hook useRef
hook useState
hook useTheme
hook useEffect
hook useCallback
handler onComp
handler onClick
```

### src/routes/auth-callback.tsx
```
hook useNavigate
hook useSearchParams
hook useIam
hook useEffect
export AuthCallbackPage
```

### src/routes/billing.tsx
```
component BillingPage
hook useTranslation
hook useNavigate
```

### src/routes/blood-panel.tsx
```
hook useState
export BloodPanelPage
handler onChange
handler onClick
```

### src/routes/clinic-search.tsx
```
component ClinicSearchPage
hook useState
hook useEffect
handler onClick
handler onChange
handler onKeyDown
```

### src/routes/cross-search.tsx
```
hook useState
export CrossSearchPage
handler onClick
handler onChange
```

### src/routes/dashboard-builder.tsx
```
component DashboardBuilderPage
hook useState
hook useCallback
hook useEffect
handler onChange
handler onDragOver
handler onDragEnd
handler onClick
```

### src/routes/data-masking.tsx
```
hook useState
export DataMaskingPage
handler onChange
handler onClick
```

### src/routes/digital-twin.tsx
```
component MiniSpark
component RiskArc
component BodyModel
component AdherenceBar
component SectionHead
component DigitalTwinPage
hook useMemo
hook useState
hook useCallback
hook useEffect
handler onResult
handler onChange
handler onClick
```

### src/routes/document-to-fhir.tsx
```
hook useState
export DocumentToFhirPage
handler onConvert
```

### src/routes/ehr-overview.tsx
```
component Sparkline
component SectionCard
component Spinner
component PatientHeaderCard
hook useState
export EHROverviewPage
handler onStatusBadge
handler onChange
handler onKeyDown
handler onClick
```

### src/routes/federated-learning.tsx
```
component FederatedLearningPage
hook useState
handler onClick
handler onChange
```

### src/routes/gene-decoder.tsx
```
hook useState
export GeneDecoderPage
handler onChange
handler onClick
```

### src/routes/health-score.tsx
```
hook useState
export HealthScorePage
handler onClick
handler onChange
```

### src/routes/healthcare-dashboard.tsx
```
component SectionHead
component AdherenceBar
component MiniSparkline
component BodySilhouette
component SkeletonCard
component HealthcareDashboardPage
hook useState
hook useCallback
hook useEffect
handler onChange
```

### src/routes/home.tsx
```
component DashboardPage
```

### src/routes/integration-dashboard.tsx
```
component NodeBox
component EdgeLine
component IntegrationDashboardPage
hook useState
hook useRef
hook useCallback
handler onComponent
handler onMouseDown
handler onComp
handler onClick
handler onMouseMove
handler onMouseUp
handler onMouseLeave
handler onDragStart
```

### src/routes/knowledge-base.tsx
```
hook useState
export KnowledgeBasePage
handler onChange
handler onClick
handler onKeyDown
```

### src/routes/login.tsx
```
hook useTranslation
hook useNavigate
hook useIam
hook useState
hook useEffect
export LoginPage
handler onSubmit
handler onChange
handler onClick
```

### src/routes/medical-image.tsx
```
hook useState
hook useRef
export MedicalImagePage
handler onChange
handler onClick
handler onError
```

### src/routes/patient-history.tsx
```
hook useState
export PatientHistoryPage
handler onClick
handler onChange
```

### src/routes/playground-ai-search.tsx
```
component PlaygroundAISearchPage
hook useAISearchStore
hook useStream
handler onClick
handler onSendMessage
```

### src/routes/playground-chat.tsx
```
component PlaygroundChatPage
hook useChatStore
hook useStream
handler onSendMessage
```

### src/routes/protected-route.tsx
```
props ProtectedRouteProps
hook useIam
hook useLocation
export ProtectedRoute
```

### src/routes/public-health.tsx
```
component DonutChart
component HBarChart
component VBarChart
component StatCard
hook useState
export PublicHealthPage
handler onClick
handler onChange
```

### src/routes/public-route.tsx
```
props PublicRouteProps
hook useIam
hook useLocation
export PublicRoute
```

### src/routes/register.tsx
```
hook useTranslation
hook useNavigate
hook useIam
hook useState
export RegisterPage
handler onSubmit
handler onChange
```

### src/routes/rx-advisor.tsx
```
hook useState
hook useRef
export RxAdvisorPage
handler onItems
handler onChange
handler onClick
```

### src/routes/settings.tsx
```
component SettingsPage
hook useTranslation
hook useAuthStore
hook useState
hook useCallback
hook useEffect
handler onChange
handler onClick
```

### src/routes/symptom-checker.tsx
```
component SymptomCheckerPage
hook useState
handler onClick
handler onChange
handler onKeyDown
```

### src/routes/upgrade.tsx
```
component FeatureCheck
component UpgradePage
hook useTranslation
```

### src/routes/wearable-data.tsx
```
component MiniSpark
component SectionHead
hook useState
hook useMemo
export WearableDataPage
handler onChange
handler onClick
```
