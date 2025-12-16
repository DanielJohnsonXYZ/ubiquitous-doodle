'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Send,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Users,
  Target,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import type { Client } from '@/types';
import type { DeepAnalysisResult } from '@/types';

export default function NotesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState('');
  const [attendees, setAttendees] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [analysis, setAnalysis] = useState<DeepAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data.clients || []);
      if (data.clients?.length === 1) {
        setSelectedClient(data.clients[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedClient || !content.trim()) {
      setError('Please select a client and paste your notes');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedClient,
          content: content.trim(),
          title: title.trim() || undefined,
          meeting_type: meetingType || undefined,
          attendees: attendees ? attendees.split(',').map(a => a.trim()) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'risk':
      case 'concern':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'opportunity':
      case 'win':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'commitment':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8 max-w-6xl mx-auto">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Add Notes & Transcripts</h1>
        <p className="text-gray-500 mt-1 text-sm lg:text-base">
          Paste meeting notes, call transcripts, or any client communication for AI analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client *
            </label>
            {loadingClients ? (
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ) : (
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company ? `(${client.company})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Weekly Check-in"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Type (optional)
              </label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select type...</option>
                <option value="weekly_checkin">Weekly Check-in</option>
                <option value="project_kickoff">Project Kickoff</option>
                <option value="review_meeting">Review Meeting</option>
                <option value="escalation_call">Escalation Call</option>
                <option value="sales_call">Sales Call</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attendees (optional, comma-separated)
            </label>
            <input
              type="text"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="e.g., Sarah (CEO), Mike (PM)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Content Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes / Transcript *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your meeting notes, call transcript, or any communication here...

Example:
Sarah: Thanks for joining. We need to discuss the timeline for Phase 2.
Me: Of course. We're on track for the December deadline.
Sarah: Actually, that's what concerns me. The team is worried we might slip..."
              rows={16}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length.toLocaleString()} characters
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !selectedClient || !content.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Analyze Notes
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div>
          {!analysis && !loading && (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Paste your notes and click analyze to get insights
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full flex items-center justify-center border-2 border-gray-200 rounded-xl p-8">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600 font-medium">Analyzing your notes...</p>
                <p className="text-gray-400 text-sm mt-1">
                  Extracting insights, commitments, and action items
                </p>
              </div>
            </div>
          )}

          {analysis && (
            <div className="space-y-4 overflow-y-auto max-h-[600px] lg:max-h-[800px] pr-2">
              {/* Executive Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                <p className="text-gray-700">{analysis.executive_summary}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className={`px-2 py-1 rounded-full ${
                    analysis.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                    analysis.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                    analysis.sentiment === 'mixed' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {analysis.sentiment} sentiment
                  </span>
                  <span className={`px-2 py-1 rounded-full ${
                    analysis.relationship.trajectory === 'improving' ? 'bg-green-100 text-green-700' :
                    analysis.relationship.trajectory === 'declining' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {analysis.relationship.trajectory} trajectory
                  </span>
                </div>
              </div>

              {/* Insights */}
              {analysis.insights.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Key Insights
                  </h3>
                  <div className="space-y-3">
                    {analysis.insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          {getTypeIcon(insight.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {insight.title}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getImpactColor(insight.impact)}`}>
                                {insight.impact} impact
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {insight.detail}
                            </p>
                            {insight.quote && (
                              <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-2 mb-2">
                                &ldquo;{insight.quote}&rdquo;
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1 text-blue-600">
                                <ArrowRight className="h-3 w-3" />
                                {insight.action}
                              </span>
                              {insight.deadline && (
                                <span className="flex items-center gap-1 text-amber-600">
                                  <Clock className="h-3 w-3" />
                                  {insight.deadline}
                                </span>
                              )}
                              <span className="text-gray-500">
                                Owner: {insight.owner}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Commitments */}
              {analysis.commitments.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Commitments to Track
                  </h3>
                  <div className="space-y-2">
                    {analysis.commitments.map((commitment, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          commitment.status === 'at_risk' ? 'bg-red-500' :
                          commitment.status === 'completed' ? 'bg-green-500' :
                          'bg-amber-500'
                        }`} />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{commitment.who}</span>
                          <span className="text-gray-500"> will </span>
                          <span className="text-gray-900">{commitment.what}</span>
                          {commitment.when && (
                            <span className="text-gray-500"> by {commitment.when}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Relationship Status */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Relationship Status
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Trust</p>
                    <p className={`font-medium ${
                      analysis.relationship.trust_level === 'strong' ? 'text-green-600' :
                      analysis.relationship.trust_level === 'strained' ? 'text-red-600' :
                      'text-gray-900'
                    }`}>
                      {analysis.relationship.trust_level}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Engagement</p>
                    <p className={`font-medium ${
                      analysis.relationship.engagement === 'highly_engaged' ? 'text-green-600' :
                      analysis.relationship.engagement === 'disengaged' ? 'text-red-600' :
                      'text-gray-900'
                    }`}>
                      {analysis.relationship.engagement.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Trajectory</p>
                    <p className={`font-medium ${
                      analysis.relationship.trajectory === 'improving' ? 'text-green-600' :
                      analysis.relationship.trajectory === 'declining' ? 'text-red-600' :
                      'text-gray-900'
                    }`}>
                      {analysis.relationship.trajectory}
                    </p>
                  </div>
                </div>
                {(analysis.relationship.warning_signs?.length || analysis.relationship.positive_signs?.length) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {analysis.relationship.warning_signs?.length ? (
                      <div>
                        <p className="text-xs text-red-600 font-medium mb-1">Warning Signs</p>
                        <ul className="text-gray-600 space-y-1">
                          {analysis.relationship.warning_signs.map((sign, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-red-400">•</span> {sign}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {analysis.relationship.positive_signs?.length ? (
                      <div>
                        <p className="text-xs text-green-600 font-medium mb-1">Positive Signs</p>
                        <ul className="text-gray-600 space-y-1">
                          {analysis.relationship.positive_signs.map((sign, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-green-400">•</span> {sign}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Next Steps */}
              {analysis.next_steps.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Recommended Next Steps</h3>
                  <div className="space-y-3">
                    {analysis.next_steps.map((step, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-green-100">
                        <div className="flex items-start gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm font-medium flex-shrink-0">
                            {step.priority}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{step.action}</p>
                            <p className="text-sm text-gray-600 mt-1">{step.reason}</p>
                            {step.suggested_message && (
                              <div className="mt-2 bg-gray-50 rounded-lg p-2 relative">
                                <p className="text-sm text-gray-700 pr-8">{step.suggested_message}</p>
                                <button
                                  onClick={() => handleCopy(step.suggested_message!, idx)}
                                  className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded"
                                >
                                  {copiedIndex === idx ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Open Questions */}
              {analysis.open_questions?.length ? (
                <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Open Questions</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {analysis.open_questions.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500">?</span> {q}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
