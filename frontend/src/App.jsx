import {
  Sparkles,
  Lightbulb,
  ArrowRight,
  Loader2,
  MessageSquareText,
  Copy,
  CheckCircle2,
  ChevronRight,
  AlertTriangle
} from 'lucide-react'
import { useState } from 'react'
import { generateFaqs as callBackend, BASE_URL } from './api.js'

const EXAMPLES = [
  'A SaaS project management tool that helps teams collaborate and track progress',
  'An e-commerce platform for handmade jewelry and accessories',
  'A fitness app that creates personalized workout plans and tracks progress',
  'A food delivery service specializing in healthy, organic meals',
]

export default function App() {
  const [description, setDescription] = useState('')
  const [faqs, setFaqs] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [errorDetail, setErrorDetail] = useState('')
  const [showErrorDetail, setShowErrorDetail] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(-1)
  const [expandedIndex, setExpandedIndex] = useState(-1)

  async function handleGenerate() {
    setError('')
    setErrorDetail('')
    setShowErrorDetail(false)
    setFaqs([])
    if (!description.trim()) {
      setError('Please enter a description.')
      return
    }

    setIsGenerating(true)
    // Simulate 2.5s generation delay
    await new Promise((r) => setTimeout(r, 2500))
    try {
      // Call backend. If backend not available, fall back to mock
      let data
      try {
        data = await callBackend(description.trim())
      } catch (e) {
        // backend unavailable; provide high-quality mock
        data = { faqs: mockFaqs(description.trim()) }
        const backendHint = `Backend unreachable at ${BASE_URL}. Ensure it is running and CORS allows requests.`
        setError('Using local AI samples because the backend is not available.')
        setErrorDetail(`${backendHint}${e?.message ? ` — ${e.message}` : ''}`)
      }
      setFaqs(Array.isArray(data.faqs) ? data.faqs : [])
      setExpandedIndex(0)
    } catch (e) {
      const code = e.code || e.status || ''
      const friendly =
        e.code === 'TIMEOUT' ? 'Request timed out. Please try again.' :
        e.code === 'NETWORK' ? 'Cannot reach the backend. Make sure it is running and CORS allows requests.' :
        e.status === 415 ? 'Invalid content type. Ensure the request is JSON.' :
        e.status === 400 ? 'Missing or invalid description.' :
        e.message || 'Failed to generate FAQs.'
      setError(friendly)
      setErrorDetail(`${e.message || ''}${code ? ` (code: ${code})` : ''}`.trim())
    } finally {
      setIsGenerating(false)
    }
  }

  function mockFaqs(desc) {
    const base = [
      'What makes your product unique?',
      'How much does it cost?',
      'Is there a free trial available?',
      'How secure is your platform?',
      'What kind of support do you provide?',
      'Can I integrate with other tools?',
    ]
    const advanced = (question) => {
      switch (question) {
        case 'What makes your product unique?':
          return (
            `Grounded in your description ("${desc}"), the product differentiates through a crisp value proposition, ` +
            `opinionated UX, and measurable outcomes. Expect rapid time‑to‑value, low switching cost, and a modular ` +
            `architecture that scales from MVP to enterprise. Key moats typically include: (1) workflow automation and ` +
            `guardrails that reduce manual effort by 40–70%, (2) embedded analytics for decision velocity, and ` +
            `(3) a secure, integration‑first surface that fits existing tooling rather than replacing it.`
          )
        case 'How much does it cost?':
          return (
            `Flexible, transparent pricing aligned to usage and feature depth. A common approach is three tiers: ` +
            `Starter (core features, generous limits) for early teams, Pro (advanced permissions, automations, ` +
            `priority support) for growing orgs, and Enterprise (SSO/SAML, audit logs, data residency, dedicated ` +
            `CSM) for regulated environments. Annual discounts and volume pricing are available; pilots/POCs can be ` +
            `structured to de‑risk adoption.`
          )
        case 'Is there a free trial available?':
          return (
            `Yes—self‑serve onboarding with a 14‑day trial is ideal. Trials typically include production‑grade features, ` +
            `guided checklists, in‑product tours, and sample data to shorten activation time. Credit card is optional; ` +
            `admins can export data at any point and continue seamlessly on a paid plan if value is proven.`
          )
        case 'How secure is your platform?':
          return (
            `Security is first‑class: encryption at rest (AES‑256) and in transit (TLS 1.2+), hardened multi‑AZ ` +
            `infrastructure, role‑based access control with least‑privilege defaults, SSO (SAML 2.0/OIDC), SCIM user ` +
            `provisioning, and comprehensive audit trails. Compliance targets typically include SOC 2 Type II and GDPR; ` +
            `data residency and BYOK/KMS options are available for enterprise.`
          )
        case 'What kind of support do you provide?':
          return (
            `Multi‑channel support: in‑app help center, email, and chat with documented SLAs (e.g., P1 < 1h, P2 same day). ` +
            `Onboarding packages include implementation workshops and solution reviews; Enterprise adds a named CSM, ` +
            `quarterly business reviews, and architecture guidance.`
          )
        case 'Can I integrate with other tools?':
          return (
            `Yes—public REST and GraphQL APIs, signed webhooks, and event streams enable deep integrations. ` +
            `First‑party connectors (e.g., Slack, Google Workspace, Microsoft 365) and commerce/ops tools (e.g., ` +
            `Shopify, HubSpot, Stripe) are available; no‑code automation via Zapier/Make covers long‑tail use cases.`
          )
        default:
          return `See the documentation for additional technical details and blueprints tailored to your use case.`
      }
    }

    return base.map((q) => ({ question: q, answer: advanced(q) }))
  }

  // Pre-baked high-quality examples mapped to example prompts
  const exampleFaqsMap = {
    [EXAMPLES[0]]: [
      { question: 'How does this improve team collaboration?', answer: 'It centralizes tasks, documents, and discussions with real‑time mentions, roles, and approvals. Teams reduce context switching and gain shared visibility over dependencies and due dates.' },
      { question: 'What’s unique versus traditional project tools?', answer: 'Opinionated workflows with automation, health checks, and portfolio views. It emphasizes execution signals (risk, blockers) and provides templates for agile, kanban, and OKR tracking.' },
      { question: 'Can it scale from startup to enterprise?', answer: 'Yes. It supports SSO/SAML, SCIM, audit logs, custom fields, and granular permissions. Workspaces isolate sensitive projects while shared components accelerate rollouts.' },
      { question: 'Does it integrate with dev and comms tools?', answer: 'Native Slack/Teams notifications, GitHub/Jira syncing, and calendar links keep teams aligned. Webhooks and APIs enable deeper bidirectional workflows.' },
      { question: 'How is progress visibility handled?', answer: 'Multi‑level reporting: project burndown, workload heatmaps, and executive rollups. Risk alerts surface schedule drift and blocked tasks proactively.' },
      { question: 'Is onboarding simple for non-technical users?', answer: 'Guided templates, in‑product tours, and importers (CSV/Jira/Asana) reduce time‑to‑value. Workspace defaults and guardrails ensure consistency.' },
    ],
    [EXAMPLES[1]]: [
      { question: 'How do you ensure product authenticity?', answer: 'Each piece declares materials, provenance, and maker profile. Optional verification adds hallmark or assay certificates. Reviews emphasize craftsmanship and care instructions.' },
      { question: 'What are shipping and returns like?', answer: 'Transparent shipping with tracking and eco‑friendly packaging. Returns allowed within 30 days for unworn items; resizing and repairs available for select pieces.' },
      { question: 'Do you support custom orders?', answer: 'Yes. Bespoke commissions allow gemstone selection, metal purity choices, and personalization (engraving). Lead times and quotes are provided upfront.' },
      { question: 'Is there gift wrapping or insurance?', answer: 'Complimentary gift wrapping and insured shipping on premium orders. Appraisals are available for high‑value items.' },
      { question: 'How do you handle sizing?', answer: 'Ring sizers and sizing charts are included; free first resizing on eligible items. Detailed fit guidance reduces exchanges.' },
      { question: 'What about maker discovery?', answer: 'Curated collections and maker stories highlight techniques (lost‑wax, filigree) and ethical sourcing, helping buyers connect with artisans.' },
    ],
    [EXAMPLES[2]]: [
      { question: 'How are workouts personalized?', answer: 'Programs adapt to goals, equipment, and recovery metrics. Progression models auto‑tune volume and intensity; deload weeks and mobility blocks prevent plateaus.' },
      { question: 'Do you support wearables?', answer: 'Integrates with Apple Health, Google Fit, and popular trackers to ingest HRV, sleep, and activity data. Recommendations update daily based on readiness.' },
      { question: 'Can I train at home or gym?', answer: 'Yes. Plans dynamically swap movements based on available equipment and time. Smart substitutions keep stimulus consistent.' },
      { question: 'Is nutrition guidance included?', answer: 'Macro targets and meal suggestions align with training blocks. Grocery lists and recipe filters (vegan, gluten‑free) support adherence.' },
      { question: 'How do I track progress?', answer: 'Session RPE, PR tracking, and body metrics drive weekly insights. Visual dashboards highlight strength, endurance, and compliance trends.' },
      { question: 'What about coaching support?', answer: 'In‑app chat and community Q&A provide feedback loops; premium adds 1:1 reviews and video form checks.' },
    ],
    [EXAMPLES[3]]: [
      { question: 'What sets your meals apart?', answer: 'Chef‑crafted menus use organic, seasonal ingredients with balanced macros. Flavor‑first recipes avoid seed oils and refined sugars.' },
      { question: 'How does delivery work?', answer: 'Scheduled delivery windows with live tracking and thermal packaging maintain freshness. Contactless hand‑off options available.' },
      { question: 'Can I manage dietary preferences?', answer: 'Yes. Filters for vegan, paleo, keto, and allergens. Profiles save dislikes; the menu dynamically adapts to preferences.' },
      { question: 'Is sustainability considered?', answer: 'Compostable packaging, local sourcing, and food‑waste reduction programs. Carbon accounting informs route optimization.' },
      { question: 'How do subscriptions work?', answer: 'Flexible plans with skip, pause, or cancel anytime. Credits rollover; reminders prevent surprise renewals.' },
      { question: 'Do you provide nutrition transparency?', answer: 'Full macros and ingredients per meal; third‑party lab tests for select items to validate claims.' },
    ],
  }

  async function copyAll() {
    const text = faqs.map((f, i) => `Q${i + 1}: ${f.question}\nA${i + 1}: ${f.answer}`).join('\n\n')
    await navigator.clipboard.writeText(text)
    setCopiedIndex(-2)
    setTimeout(() => setCopiedIndex(-1), 2000)
  }

  async function copyOne(i) {
    const f = faqs[i]
    await navigator.clipboard.writeText(`Q: ${f.question}\nA: ${f.answer}`)
    setCopiedIndex(i)
    setTimeout(() => setCopiedIndex(-1), 2000)
  }

  function toggleExpand(i) {
    setExpandedIndex((prev) => (prev === i ? -1 : i))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* floating blur circles */}
      <div className="pointer-events-none absolute -top-8 -left-8 h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 opacity-30 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute top-1/3 -right-8 h-24 w-24 md:h-28 md:w-28 rounded-full bg-gradient-to-br from-purple-400 to-teal-400 opacity-30 blur-3xl animate-pulse" style={{ animationDelay: '500ms' }} />
      <div className="pointer-events-none absolute bottom-8 left-1/3 h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-teal-400 to-blue-400 opacity-30 blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }} />

      <header className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 pt-10 pb-6 text-center">
          <div className="inline-flex items-center gap-2 text-blue-600">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">AI-Powered</span>
          </div>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI FAQ Generator
          </h1>
          <p className="mt-3 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Transform your product description into comprehensive, professional FAQs instantly with the power of AI
          </p>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 pb-16">
        {/* Input Card */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
          <label htmlFor="desc" className="block text-sm font-medium text-gray-700 mb-2">Product Description</label>
          <textarea
            id="desc"
            className="h-32 md:h-40 w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
            placeholder="Enter a detailed description of your product, service, or website. Include key features, benefits, and what makes it unique..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Example Prompts */}
          <div className="mt-4">
            <div className="flex items-center gap-2 text-amber-600">
              <Lightbulb className="h-4 w-4" />
              <span className="text-sm font-medium">Try these examples:</span>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              {EXAMPLES.map((ex, i) => (
                <div key={i} className="group">
                  <button
                    type="button"
                    className="w-full text-left text-sm bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg px-3 py-2 transition-all"
                    onClick={() => {
                      setDescription(ex)
                      // Also prefill sample FAQs to demonstrate when backend is not ready
                      if (exampleFaqsMap[ex]) {
                        setFaqs(exampleFaqsMap[ex])
                        setExpandedIndex(0)
                      }
                    }}
                  >
                    {ex}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-4 py-3 transition-all disabled:from-gray-400 disabled:to-gray-500"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating FAQs...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI Generate FAQs
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{error}</p>
                  {errorDetail && showErrorDetail && (
                    <p className="text-xs mt-1 text-red-700/90">{errorDetail}</p>
                  )}
                </div>
                {errorDetail && (
                  <button
                    type="button"
                    onClick={() => setShowErrorDetail((s) => !s)}
                    className="text-xs underline decoration-dotted"
                  >
                    {showErrorDetail ? 'Hide' : 'Details'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="ml-2 text-xs px-2 py-1 rounded border border-red-200 hover:bg-red-100"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Results */}
        <section className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Generated FAQs</h2>
            </div>
            <button
              type="button"
              onClick={copyAll}
              disabled={faqs.length === 0}
              className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {copiedIndex === -2 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy All
                </>
              )}
            </button>
          </div>

          {/* Loading skeleton */}
          {isGenerating && (
            <ul className="mt-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="border border-gray-200 rounded-xl p-4">
                  <div className="skeleton h-4 w-1/2" />
                  <div className="skeleton h-4 w-5/6 mt-2" />
                  <div className="skeleton h-4 w-2/3 mt-2" />
                </li>
              ))}
            </ul>
          )}

          {/* Empty state */}
          {!isGenerating && faqs.length === 0 && !error && (
            <div className="mt-4 text-sm text-gray-600">
              Your results will appear here after generation.
            </div>
          )}

          {/* Results list */}
          {!isGenerating && faqs.length > 0 && (
            <ul className="mt-4 space-y-3">
              {faqs.map((f, i) => {
                const isOpen = expandedIndex === i
                return (
                  <li key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleExpand(i)}
                      className="w-full text-left bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 px-4 py-3 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-800">{f.question}</span>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div
                      className={`px-4 pt-0 pb-4 grid transition-all ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                    >
                      <div className="overflow-hidden">
                        <div className="pt-3 text-gray-700 leading-relaxed">
                          {f.answer}
                        </div>
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => copyOne(i)}
                            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
                          >
                            {copiedIndex === i ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-green-600" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" /> Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <div className="text-center text-xs text-gray-500 mt-8">
          Backend: http://localhost:5000 • Configure via VITE_API_BASE_URL
        </div>
      </main>
    </div>
  )
}


