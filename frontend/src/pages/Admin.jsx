import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { format } from 'date-fns'
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function Admin() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const [scrapeMsg, setScrapeMsg] = useState(null)

  async function loadLogs() {
    setLoading(true)
    try {
      const data = await api.getScrapeLogs()
      setLogs(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadLogs() }, [])

  async function triggerScrape() {
    setScraping(true)
    setScrapeMsg(null)
    try {
      const res = await api.triggerScrape()
      setScrapeMsg({ ok: true, text: res.message || 'Scrape triggered successfully' })
      setTimeout(loadLogs, 3000)
    } catch (e) {
      setScrapeMsg({ ok: false, text: e.message })
    } finally {
      setScraping(false)
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl md:text-4xl text-gray-900">
            ADMIN <span className="text-court-700">DASHBOARD</span>
          </h1>
          <p className="text-gray-500 font-body mt-1">Data management and scrape control</p>
        </div>
        <button
          onClick={triggerScrape}
          disabled={scraping}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw size={16} className={scraping ? 'animate-spin' : ''} />
          {scraping ? 'Scraping…' : 'Run Scraper Now'}
        </button>
      </div>

      {scrapeMsg && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-body ${
          scrapeMsg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {scrapeMsg.ok ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {scrapeMsg.text}
        </div>
      )}

      {/* Scrape logs */}
      <div>
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">Scrape History</h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-gray-400 text-sm font-body py-8 text-center bg-gray-50 rounded-xl">
            No scrape logs yet. Run the scraper to populate data.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['City', 'Status', 'Found', 'Upserted', 'Error', 'Time'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-body font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{log.city}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                        log.status === 'success'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {log.status === 'success' ? (
                          <CheckCircle size={11} />
                        ) : (
                          <XCircle size={11} />
                        )}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.sessions_found ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{log.sessions_upserted ?? '—'}</td>
                    <td className="px-4 py-3 text-red-500 text-xs max-w-xs truncate">
                      {log.error_message || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {log.scraped_at
                        ? format(new Date(log.scraped_at), 'MMM d, h:mm a')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
