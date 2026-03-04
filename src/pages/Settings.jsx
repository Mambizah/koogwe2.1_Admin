import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '../components/UI'
import { adminConfigService } from '../services/api'

const DEFAULT_PRICING = {
  city: 'Cayenne',
  zone: 'CENTRE',
  hourCoefficient: 1,
  trafficCoefficient: 1,
  weatherCoefficient: 1,
  demandCoefficient: 1,
  vehicleCoefficient: 1,
  minPrice: 5,
  maxSurge: 3,
}

const DEFAULT_FINANCIALS = {
  driverShare: 80,
  platformShare: 20,
  companyShare: 0,
  autoSplit: true,
}

const DEFAULT_SECURITY = {
  jwtTtlMinutes: 30,
  refreshTtlDays: 30,
  geofencingEnabled: true,
  sosEnabled: true,
  anomalyDetectionEnabled: true,
  auditLogsEnabled: true,
}

const DEFAULT_PAYMENTS = {
  stripeEnabled: true,
  paypalEnabled: false,
  mobileMoneyEnabled: true,
  escrowEnabled: true,
  mfaEnabled: true,
}

const unwrap = (value) => value?.data || value?.item || value || {}
const getAny = (source, keys, fallback) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) return source[key]
  }
  return fallback
}
const toNumber = (value, fallback = 0) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}
const toBool = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback
  return Boolean(value)
}

const extractApiError = (error) => {
  const responseData = error?.response?.data
  const message =
    responseData?.message ||
    responseData?.error ||
    error?.message ||
    'Erreur inconnue'
  return String(message)
}

const normalizePricing = (source) => ({
  city: String(getAny(source, ['city', 'pricingCity'], DEFAULT_PRICING.city)),
  zone: String(getAny(source, ['zone', 'pricingZone'], DEFAULT_PRICING.zone)),
  hourCoefficient: toNumber(getAny(source, ['hourCoefficient', 'hour_coefficient', 'hourlyMultiplier'], DEFAULT_PRICING.hourCoefficient), DEFAULT_PRICING.hourCoefficient),
  trafficCoefficient: toNumber(getAny(source, ['trafficCoefficient', 'traffic_coefficient', 'trafficMultiplier'], DEFAULT_PRICING.trafficCoefficient), DEFAULT_PRICING.trafficCoefficient),
  weatherCoefficient: toNumber(getAny(source, ['weatherCoefficient', 'weather_coefficient', 'weatherMultiplier'], DEFAULT_PRICING.weatherCoefficient), DEFAULT_PRICING.weatherCoefficient),
  demandCoefficient: toNumber(getAny(source, ['demandCoefficient', 'demand_coefficient', 'demandMultiplier'], DEFAULT_PRICING.demandCoefficient), DEFAULT_PRICING.demandCoefficient),
  vehicleCoefficient: toNumber(getAny(source, ['vehicleCoefficient', 'vehicle_coefficient', 'vehicleMultiplier'], DEFAULT_PRICING.vehicleCoefficient), DEFAULT_PRICING.vehicleCoefficient),
  minPrice: toNumber(getAny(source, ['minPrice', 'min_price', 'minimumFare'], DEFAULT_PRICING.minPrice), DEFAULT_PRICING.minPrice),
  maxSurge: toNumber(getAny(source, ['maxSurge', 'max_surge', 'surgeCap'], DEFAULT_PRICING.maxSurge), DEFAULT_PRICING.maxSurge),
})

const normalizeFinancials = (source) => ({
  driverShare: toNumber(getAny(source, ['driverShare', 'driver_share'], DEFAULT_FINANCIALS.driverShare), DEFAULT_FINANCIALS.driverShare),
  platformShare: toNumber(getAny(source, ['platformShare', 'platform_share'], DEFAULT_FINANCIALS.platformShare), DEFAULT_FINANCIALS.platformShare),
  companyShare: toNumber(getAny(source, ['companyShare', 'company_share'], DEFAULT_FINANCIALS.companyShare), DEFAULT_FINANCIALS.companyShare),
  autoSplit: toBool(getAny(source, ['autoSplit', 'auto_split'], DEFAULT_FINANCIALS.autoSplit), DEFAULT_FINANCIALS.autoSplit),
})

const normalizeSecurity = (source) => ({
  jwtTtlMinutes: toNumber(getAny(source, ['jwtTtlMinutes', 'jwt_ttl_minutes', 'jwtTtl'], DEFAULT_SECURITY.jwtTtlMinutes), DEFAULT_SECURITY.jwtTtlMinutes),
  refreshTtlDays: toNumber(getAny(source, ['refreshTtlDays', 'refresh_ttl_days', 'refreshTtl'], DEFAULT_SECURITY.refreshTtlDays), DEFAULT_SECURITY.refreshTtlDays),
  geofencingEnabled: toBool(getAny(source, ['geofencingEnabled', 'geofencing_enabled'], DEFAULT_SECURITY.geofencingEnabled), DEFAULT_SECURITY.geofencingEnabled),
  sosEnabled: toBool(getAny(source, ['sosEnabled', 'sos_enabled'], DEFAULT_SECURITY.sosEnabled), DEFAULT_SECURITY.sosEnabled),
  anomalyDetectionEnabled: toBool(getAny(source, ['anomalyDetectionEnabled', 'anomaly_detection_enabled'], DEFAULT_SECURITY.anomalyDetectionEnabled), DEFAULT_SECURITY.anomalyDetectionEnabled),
  auditLogsEnabled: toBool(getAny(source, ['auditLogsEnabled', 'audit_logs_enabled'], DEFAULT_SECURITY.auditLogsEnabled), DEFAULT_SECURITY.auditLogsEnabled),
})

const normalizePayments = (source) => ({
  stripeEnabled: toBool(getAny(source, ['stripeEnabled', 'stripe_enabled'], DEFAULT_PAYMENTS.stripeEnabled), DEFAULT_PAYMENTS.stripeEnabled),
  paypalEnabled: toBool(getAny(source, ['paypalEnabled', 'paypal_enabled'], DEFAULT_PAYMENTS.paypalEnabled), DEFAULT_PAYMENTS.paypalEnabled),
  mobileMoneyEnabled: toBool(getAny(source, ['mobileMoneyEnabled', 'mobile_money_enabled'], DEFAULT_PAYMENTS.mobileMoneyEnabled), DEFAULT_PAYMENTS.mobileMoneyEnabled),
  escrowEnabled: toBool(getAny(source, ['escrowEnabled', 'escrow_enabled'], DEFAULT_PAYMENTS.escrowEnabled), DEFAULT_PAYMENTS.escrowEnabled),
  mfaEnabled: toBool(getAny(source, ['mfaEnabled', 'mfa_enabled', 'paymentsMfaEnabled'], DEFAULT_PAYMENTS.mfaEnabled), DEFAULT_PAYMENTS.mfaEnabled),
})

const buildPricingPayload = (payload, snake = false) => snake
  ? {
      city: payload.city,
      zone: payload.zone,
      hour_coefficient: payload.hourCoefficient,
      traffic_coefficient: payload.trafficCoefficient,
      weather_coefficient: payload.weatherCoefficient,
      demand_coefficient: payload.demandCoefficient,
      vehicle_coefficient: payload.vehicleCoefficient,
      min_price: payload.minPrice,
      max_surge: payload.maxSurge,
    }
  : payload

const buildFinancialsPayload = (payload, snake = false) => snake
  ? {
      driver_share: payload.driverShare,
      platform_share: payload.platformShare,
      company_share: payload.companyShare,
      auto_split: payload.autoSplit,
    }
  : payload

const buildSecurityPayload = (payload, snake = false) => snake
  ? {
      jwt_ttl_minutes: payload.jwtTtlMinutes,
      refresh_ttl_days: payload.refreshTtlDays,
      geofencing_enabled: payload.geofencingEnabled,
      sos_enabled: payload.sosEnabled,
      anomaly_detection_enabled: payload.anomalyDetectionEnabled,
      audit_logs_enabled: payload.auditLogsEnabled,
    }
  : payload

const buildPaymentsPayload = (payload, snake = false) => snake
  ? {
      stripe_enabled: payload.stripeEnabled,
      paypal_enabled: payload.paypalEnabled,
      mobile_money_enabled: payload.mobileMoneyEnabled,
      escrow_enabled: payload.escrowEnabled,
      mfa_enabled: payload.mfaEnabled,
    }
  : payload

const withDtoFallback = async (call, payloadBuilder, source) => {
  try {
    return await call(payloadBuilder(source, false))
  } catch {
    return call(payloadBuilder(source, true))
  }
}

const formatModuleErrors = (prefix, moduleErrors) => {
  if (!moduleErrors.length) return prefix
  const details = moduleErrors.map(e => `${e.module}: ${e.message}`).join(' | ')
  return `${prefix} ${details}`
}

function NumberField({ label, value, onChange, min = 0, max, step = '0.1' }) {
  return (
    <div className="field" style={{ marginBottom: 10 }}>
      <label className="label">{label}</label>
      <input
        className="input"
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  )
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 10 }}>
      <span style={{ fontSize: 13 }}>{label}</span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    </label>
  )
}

export default function Settings() {
  const [pricing, setPricing] = useState(DEFAULT_PRICING)
  const [financials, setFinancials] = useState(DEFAULT_FINANCIALS)
  const [security, setSecurity] = useState(DEFAULT_SECURITY)
  const [payments, setPayments] = useState(DEFAULT_PAYMENTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)
  const [errorReport, setErrorReport] = useState('')
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setNotice(null)
    const moduleErrors = []

    const [allResult, pricingResult, financialResult, securityResult, paymentResult] = await Promise.allSettled([
      adminConfigService.get(),
      adminConfigService.getPricing(),
      adminConfigService.getFinancials(),
      adminConfigService.getSecurity(),
      adminConfigService.getPayments(),
    ])

    const root = allResult.status === 'fulfilled' ? unwrap(allResult.value) : {}

    const pickSource = (label, result, fromRoot) => {
      if (fromRoot && Object.keys(fromRoot).length) return fromRoot
      if (result.status === 'fulfilled') return unwrap(result.value)
      moduleErrors.push({ module: label, message: extractApiError(result.reason) })
      return null
    }

    const pricingSource = pickSource('pricing', pricingResult, unwrap(root.pricing))
    const financialSource = pickSource('financials', financialResult, unwrap(root.financials || root.finance))
    const securitySource = pickSource('security', securityResult, unwrap(root.security))
    const paymentSource = pickSource('payments', paymentResult, unwrap(root.payments || root.payment))

    setPricing(pricingSource ? normalizePricing(pricingSource) : DEFAULT_PRICING)
    setFinancials(financialSource ? normalizeFinancials(financialSource) : DEFAULT_FINANCIALS)
    setSecurity(securitySource ? normalizeSecurity(securitySource) : DEFAULT_SECURITY)
    setPayments(paymentSource ? normalizePayments(paymentSource) : DEFAULT_PAYMENTS)

    if (moduleErrors.length) {
      console.error('Settings load errors:', moduleErrors)
      setErrorReport(moduleErrors.map(e => `${e.module}: ${e.message}`).join('\n'))
      setNotice({ type: 'error', message: formatModuleErrors('Chargement partiel des paramètres.', moduleErrors) })
    }

    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const saveAll = async () => {
    const splitTotal = toNumber(financials.driverShare) + toNumber(financials.platformShare) + toNumber(financials.companyShare)
    if (splitTotal !== 100) {
      setNotice({ type: 'error', message: 'La répartition financière doit totaliser 100%.' })
      return
    }

    setSaving(true)
    setNotice(null)
    setCopied(false)
    setErrorReport('')
    const saveResults = await Promise.allSettled([
      withDtoFallback(adminConfigService.updatePricing, buildPricingPayload, pricing),
      withDtoFallback(adminConfigService.updateFinancials, buildFinancialsPayload, financials),
      withDtoFallback(adminConfigService.updateSecurity, buildSecurityPayload, security),
      withDtoFallback(adminConfigService.updatePayments, buildPaymentsPayload, payments),
    ])

    const moduleErrors = []
    const labels = ['pricing', 'financials', 'security', 'payments']
    saveResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        moduleErrors.push({ module: labels[index], message: extractApiError(result.reason) })
      }
    })

    if (moduleErrors.length) {
      try {
        await adminConfigService.update({
          pricing: buildPricingPayload(pricing, false),
          financials: buildFinancialsPayload(financials, false),
          security: buildSecurityPayload(security, false),
          payments: buildPaymentsPayload(payments, false),
        })
        setNotice({ type: 'success', message: 'Paramètres enregistrés via endpoint global.' })
      } catch (error) {
        moduleErrors.push({ module: 'global', message: extractApiError(error) })
        console.error('Settings save errors:', moduleErrors)
        setErrorReport(moduleErrors.map(e => `${e.module}: ${e.message}`).join('\n'))
        setNotice({ type: 'error', message: formatModuleErrors('Échec partiel de l’enregistrement.', moduleErrors) })
      }
    } else {
      setNotice({ type: 'success', message: 'Paramètres enregistrés avec succès.' })
      setErrorReport('')
    }

    setSaving(false)
  }

  return (
    <div style={{ padding: '24px 28px', overflow: 'auto', height: '100%' }}>
      <PageHeader
        title="Paramètres Admin"
        subtitle="Tarification dynamique, répartition financière, sécurité et paiements"
      >
        <button className="btn btn-ghost" onClick={load} disabled={loading || saving}>Actualiser</button>
        <button className="btn btn-primary" onClick={saveAll} disabled={loading || saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </PageHeader>

      {notice && (
        <div
          style={{
            marginBottom: 14,
            padding: '10px 12px',
            borderRadius: 8,
            border: notice.type === 'success' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
            background: notice.type === 'success' ? 'var(--green-l)' : 'var(--red-l)',
            color: notice.type === 'success' ? 'var(--green)' : 'var(--red)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {notice.message}
          {notice.type === 'error' && errorReport && (
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--text)', borderColor: 'rgba(255,255,255,0.2)' }}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(errorReport)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1800)
                  } catch {}
                }}
              >
                {copied ? 'Copié' : 'Copier le rapport'}
              </button>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div style={{ marginBottom: 14, fontSize: 12, color: 'var(--text2)' }}>
          Chargement des paramètres en cours...
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Tarification dynamique</div>
          <div className="field" style={{ marginBottom: 10 }}>
            <label className="label">Ville</label>
            <input className="input" value={pricing.city} onChange={e => setPricing(p => ({ ...p, city: e.target.value }))} />
          </div>
          <div className="field" style={{ marginBottom: 10 }}>
            <label className="label">Zone</label>
            <input className="input" value={pricing.zone} onChange={e => setPricing(p => ({ ...p, zone: e.target.value }))} />
          </div>
          <NumberField label="Coeff horaire" value={pricing.hourCoefficient} onChange={v => setPricing(p => ({ ...p, hourCoefficient: v }))} />
          <NumberField label="Coeff trafic" value={pricing.trafficCoefficient} onChange={v => setPricing(p => ({ ...p, trafficCoefficient: v }))} />
          <NumberField label="Coeff météo" value={pricing.weatherCoefficient} onChange={v => setPricing(p => ({ ...p, weatherCoefficient: v }))} />
          <NumberField label="Coeff demande" value={pricing.demandCoefficient} onChange={v => setPricing(p => ({ ...p, demandCoefficient: v }))} />
          <NumberField label="Coeff véhicule" value={pricing.vehicleCoefficient} onChange={v => setPricing(p => ({ ...p, vehicleCoefficient: v }))} />
          <NumberField label="Prix minimum" value={pricing.minPrice} onChange={v => setPricing(p => ({ ...p, minPrice: v }))} step="1" />
          <NumberField label="Plafond de majoration" value={pricing.maxSurge} onChange={v => setPricing(p => ({ ...p, maxSurge: v }))} />
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Répartition financière</div>
          <NumberField label="Part chauffeur (%)" value={financials.driverShare} onChange={v => setFinancials(p => ({ ...p, driverShare: v }))} min={0} max={100} step="1" />
          <NumberField label="Part plateforme (%)" value={financials.platformShare} onChange={v => setFinancials(p => ({ ...p, platformShare: v }))} min={0} max={100} step="1" />
          <NumberField label="Part entreprise (%)" value={financials.companyShare} onChange={v => setFinancials(p => ({ ...p, companyShare: v }))} min={0} max={100} step="1" />
          <ToggleField label="Split automatique après course" checked={financials.autoSplit} onChange={v => setFinancials(p => ({ ...p, autoSplit: v }))} />
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Sécurité</div>
          <NumberField label="JWT TTL (minutes)" value={security.jwtTtlMinutes} onChange={v => setSecurity(p => ({ ...p, jwtTtlMinutes: v }))} min={5} step="5" />
          <NumberField label="Refresh TTL (jours)" value={security.refreshTtlDays} onChange={v => setSecurity(p => ({ ...p, refreshTtlDays: v }))} min={1} step="1" />
          <ToggleField label="Géofencing activé" checked={security.geofencingEnabled} onChange={v => setSecurity(p => ({ ...p, geofencingEnabled: v }))} />
          <ToggleField label="Bouton SOS activé" checked={security.sosEnabled} onChange={v => setSecurity(p => ({ ...p, sosEnabled: v }))} />
          <ToggleField label="Détection anomalies trajets" checked={security.anomalyDetectionEnabled} onChange={v => setSecurity(p => ({ ...p, anomalyDetectionEnabled: v }))} />
          <ToggleField label="Logs d'audit activés" checked={security.auditLogsEnabled} onChange={v => setSecurity(p => ({ ...p, auditLogsEnabled: v }))} />
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Paiements</div>
          <ToggleField label="Stripe activé" checked={payments.stripeEnabled} onChange={v => setPayments(p => ({ ...p, stripeEnabled: v }))} />
          <ToggleField label="PayPal activé" checked={payments.paypalEnabled} onChange={v => setPayments(p => ({ ...p, paypalEnabled: v }))} />
          <ToggleField label="Mobile Money activé" checked={payments.mobileMoneyEnabled} onChange={v => setPayments(p => ({ ...p, mobileMoneyEnabled: v }))} />
          <ToggleField label="Escrow activé" checked={payments.escrowEnabled} onChange={v => setPayments(p => ({ ...p, escrowEnabled: v }))} />
          <ToggleField label="MFA paiement activé" checked={payments.mfaEnabled} onChange={v => setPayments(p => ({ ...p, mfaEnabled: v }))} />
        </div>
      </div>
    </div>
  )
}
