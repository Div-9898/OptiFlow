'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Sparkles, 
  Download, 
  CheckCircle,
  Clock,
  FileCheck,
  Settings,
  Eye,
  Printer,
  Share2,
  Copy,
  Trash2,
  RefreshCw,
  ChevronRight,
  Building2,
  Shield,
  Scale,
  Activity,
  TrendingUp,
  AlertTriangle,
  Users,
  Truck,
  Leaf,
  BarChart2,
  Target,
  Zap,
  Calendar,
  FileBarChart,
  Layers,
  BookOpen,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageLayout from '@/components/dashboard/PageLayout';
import {
  PolicyKPIDashboard,
  TemplateGauges,
  DocumentFeed,
  ComplianceIndicator
} from '@/components/policy';

// Types
interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: string;
  sections: string[];
}

interface DocumentHistory {
  id: string;
  templateId: string;
  name: string;
  createdAt: Date;
  content: string;
}

interface CustomizationOptions {
  includeSummary: boolean;
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeCompliance: boolean;
  dateRange: string;
  detailLevel: 'summary' | 'standard' | 'detailed';
}

// Markdown renderer component
function MarkdownRenderer({ content }: { content: string }) {
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let inTable = false;
    let tableRows: string[] = [];
    let inList = false;
    let listItems: string[] = [];
    
    const processLine = (line: string, index: number) => {
      // Handle tables
      if (line.startsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        tableRows.push(line);
        return null;
      } else if (inTable) {
        inTable = false;
        const table = renderTable(tableRows);
        tableRows = [];
        elements.push(table);
      }
      
      // Handle lists
      if (line.match(/^-\s/)) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(line.replace(/^-\s/, ''));
        return null;
      } else if (inList) {
        inList = false;
        elements.push(
          <ul key={`list-${index}`} className="list-disc list-inside space-y-1 my-3 text-gray-300">
            {listItems.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: formatInlineStyles(item) }} />
            ))}
          </ul>
        );
        listItems = [];
      }
      
      // H1
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold text-white mb-4 mt-6 border-b border-dark-600 pb-2">{line.replace('# ', '')}</h1>;
      }
      // H2
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold text-accent-cyan mb-3 mt-5">{line.replace('## ', '')}</h2>;
      }
      // H3
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-medium text-accent-purple mb-2 mt-4">{line.replace('### ', '')}</h3>;
      }
      // Horizontal rule
      if (line.startsWith('---')) {
        return <hr key={index} className="border-dark-600 my-6" />;
      }
      // Blockquote
      if (line.startsWith('>')) {
        return (
          <blockquote key={index} className="border-l-4 border-accent-magenta pl-4 my-3 text-gray-400 italic">
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      // Numbered list
      if (line.match(/^\d+\.\s/)) {
        return (
          <div key={index} className="flex gap-2 my-1 text-gray-300">
            <span className="text-accent-cyan font-medium">{line.match(/^\d+/)?.[0]}.</span>
            <span dangerouslySetInnerHTML={{ __html: formatInlineStyles(line.replace(/^\d+\.\s/, '')) }} />
          </div>
        );
      }
      // Emphasis line (italic at start)
      if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
        return <p key={index} className="text-sm text-gray-500 italic my-2">{line.replace(/^\*|\*$/g, '')}</p>;
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      // Regular paragraph
      return <p key={index} className="text-gray-300 my-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInlineStyles(line) }} />;
    };
    
    const formatInlineStyles = (text: string): string => {
      // Bold
      text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
      // Italic
      text = text.replace(/\*([^*]+)\*/g, '<em class="text-gray-400">$1</em>');
      // Code
      text = text.replace(/`([^`]+)`/g, '<code class="bg-dark-700 px-2 py-0.5 rounded text-accent-cyan text-sm">$1</code>');
      // Checkmarks
      text = text.replace(/✅/g, '<span class="text-green-400">✓</span>');
      text = text.replace(/⚠️/g, '<span class="text-yellow-400">⚠</span>');
      text = text.replace(/❌/g, '<span class="text-red-400">✗</span>');
      return text;
    };
    
    const renderTable = (rows: string[]): JSX.Element => {
      if (rows.length < 2) return <></>;
      
      const headers = rows[0].split('|').filter(cell => cell.trim());
      const dataRows = rows.slice(2).map(row => row.split('|').filter(cell => cell.trim()));
      
      return (
        <div key={`table-${Math.random()}`} className="my-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-dark-600">
                {headers.map((header, i) => (
                  <th key={i} className="text-left py-2 px-3 text-sm font-semibold text-white bg-dark-700">{header.trim()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, i) => (
                <tr key={i} className="border-b border-dark-700 hover:bg-dark-700/50">
                  {row.map((cell, j) => (
                    <td key={j} className="py-2 px-3 text-sm text-gray-300" dangerouslySetInnerHTML={{ __html: formatInlineStyles(cell.trim()) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };
    
    lines.forEach((line, index) => {
      const element = processLine(line, index);
      if (element) elements.push(element);
    });
    
    // Handle remaining list items
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key="final-list" className="list-disc list-inside space-y-1 my-3 text-gray-300">
          {listItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: formatInlineStyles(item) }} />
          ))}
        </ul>
      );
    }
    
    // Handle remaining table
    if (inTable && tableRows.length > 0) {
      elements.push(renderTable(tableRows));
    }
    
    return elements;
  };
  
  return <div className="markdown-content">{renderMarkdown(content)}</div>;
}

export default function PolicyGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [displayedContent, setDisplayedContent] = useState<string>('');
  const [showCustomization, setShowCustomization] = useState(false);
  const [documentHistory, setDocumentHistory] = useState<DocumentHistory[]>([
    { id: '1', templateId: 'operational_efficiency', name: 'Weekly Ops Report', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), content: '' },
    { id: '2', templateId: 'risk_assessment', name: 'Risk Assessment Q1', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), content: '' },
    { id: '3', templateId: 'fairness_audit', name: 'Fairness Audit Dec', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), content: '' },
  ]);
  const [customization, setCustomization] = useState<CustomizationOptions>({
    includeSummary: true,
    includeCharts: true,
    includeRecommendations: true,
    includeCompliance: true,
    dateRange: 'month',
    detailLevel: 'standard'
  });
  const [editingName, setEditingName] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const templates: Template[] = [
    {
      id: 'operational_efficiency',
      name: 'Operational Efficiency Report',
      description: 'VRP results, cost analysis, and route optimization insights',
      icon: TrendingUp,
      color: '#00f5ff',
      category: 'Operations',
      sections: ['Executive Summary', 'Route Optimization', 'Cost Analysis', 'Fleet Utilization', 'Recommendations']
    },
    {
      id: 'risk_assessment',
      name: 'Risk Assessment Report',
      description: 'Fleet risk analysis with mitigation strategies',
      icon: Shield,
      color: '#ef4444',
      category: 'Safety',
      sections: ['Risk Overview', 'Vehicle Analysis', 'Driver Assessment', 'Incident Report', 'Mitigation Plan']
    },
    {
      id: 'fairness_audit',
      name: 'Fairness Audit Report',
      description: 'Bias detection and equity analysis across operations',
      icon: Scale,
      color: '#39ff14',
      category: 'Ethics',
      sections: ['Equity Metrics', 'Geographic Analysis', 'Driver Workload', 'Customer Segments', 'Action Items']
    },
    {
      id: 'ethical_compliance',
      name: 'Ethical Compliance Report',
      description: 'Ethical framework compliance assessment',
      icon: BookOpen,
      color: '#a855f7',
      category: 'Compliance',
      sections: ['Framework Alignment', 'Stakeholder Impact', 'Decision Audit', 'Compliance Status', 'Improvements']
    },
    {
      id: 'sustainability',
      name: 'Sustainability Report',
      description: 'Environmental impact and green initiatives progress',
      icon: Leaf,
      color: '#10b981',
      category: 'Environment',
      sections: ['Carbon Footprint', 'EV Fleet Progress', 'Emission Reduction', 'Green Initiatives', 'Future Goals']
    },
    {
      id: 'stakeholder_brief',
      name: 'Stakeholder Brief',
      description: 'Executive summary for stakeholder communication',
      icon: Users,
      color: '#f59e0b',
      category: 'Communication',
      sections: ['Key Highlights', 'Performance Metrics', 'Strategic Initiatives', 'Risk Summary', 'Next Quarter']
    },
    {
      id: 'fleet_performance',
      name: 'Fleet Performance Report',
      description: 'Comprehensive vehicle and driver analytics',
      icon: Truck,
      color: '#3b82f6',
      category: 'Operations',
      sections: ['Fleet Overview', 'Vehicle Health', 'Driver Metrics', 'Maintenance Log', 'Optimization Tips']
    },
    {
      id: 'quarterly_review',
      name: 'Quarterly Business Review',
      description: 'Complete quarterly performance analysis',
      icon: BarChart2,
      color: '#ec4899',
      category: 'Executive',
      sections: ['Quarter Summary', 'KPI Analysis', 'Financial Impact', 'Challenges', 'Q+1 Objectives']
    }
  ];

  // Generate document content based on template and customization
  const generateContent = (templateId: string): string => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return '';
    
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const contentMap: Record<string, string> = {
      operational_efficiency: `# Operational Efficiency Report

${customization.includeSummary ? `## Executive Summary

This report provides a comprehensive analysis of our logistics operations for **${currentDate}**. Key findings indicate significant opportunities for optimization while maintaining our commitment to ethical operations and stakeholder satisfaction.

> Overall operational efficiency has improved by **18%** compared to the previous period.

` : ''}## Key Performance Indicators

### Route Optimization Metrics
- **Route Efficiency Score**: 94.2% ✅
- **Average Delivery Time**: 32 minutes (↓ 8% from baseline)
- **Miles per Delivery**: 4.2 miles (optimized)
- **Route Deviation Rate**: 3.1% (within acceptable range)

### Cost Analysis
- **Total Operating Cost**: $847,320 (-12% vs budget)
- **Cost per Delivery**: $8.47 (industry avg: $12.30)
- **Fuel Efficiency**: 28.4 MPG average (+6%)
- **Maintenance Savings**: $23,400 from predictive maintenance

### Fleet Utilization
- **Capacity Utilization**: 87% average
- **Active Vehicle Rate**: 94.2%
- **Idle Time**: 8.3% (target: <10%) ✅
- **Peak Hour Coverage**: 98.5%

${customization.includeCharts ? `### Performance Trends

| Metric | Week 1 | Week 2 | Week 3 | Week 4 | Trend |
|--------|--------|--------|--------|--------|-------|
| On-Time Rate | 91% | 93% | 94% | 95% | ✅ +4% |
| Cost/Mile | $1.82 | $1.78 | $1.75 | $1.71 | ✅ -6% |
| Customer Sat | 4.3 | 4.4 | 4.5 | 4.6 | ✅ +7% |
| Fleet Health | 88% | 89% | 91% | 92% | ✅ +5% |

` : ''}${customization.includeRecommendations ? `## Recommendations

1. **Increase Al Quoz Zone Coverage**: Deploy 2 additional vehicles during 2-5 PM peak
2. **Implement Dynamic Routing**: Enable real-time route adjustments for traffic
3. **Expand Predictive Maintenance**: Reduce vehicle downtime by additional 15%
4. **Optimize Loading Sequences**: Reduce dock time by 20%
5. **Deploy Electric Vehicles**: Start with 10% of urban routes

` : ''}${customization.includeCompliance ? `## Compliance Status

| Regulation | Status | Score | Last Audit |
|------------|--------|-------|------------|
| DOT Requirements | ✅ Compliant | 95% | Jan 15 |
| Labor Laws | ✅ Compliant | 92% | Jan 10 |
| Environmental | ✅ Compliant | 88% | Jan 12 |
| Safety Standards | ✅ Compliant | 96% | Jan 18 |

` : ''}---
*Generated by Logistics AI Platform | Powered by Gemini*
*Report Date: ${new Date().toLocaleDateString()} | Classification: Internal*`,

      risk_assessment: `# Risk Assessment Report

${customization.includeSummary ? `## Executive Summary

This comprehensive risk assessment evaluates our logistics operations' safety posture for **${currentDate}**. The analysis covers vehicle health, driver behavior, environmental factors, and operational risks.

> **Overall Fleet Risk Score: 0.28 (LOW)** - Fleet operating within safe parameters.

` : ''}## Risk Dashboard

### Overall Risk Metrics
- **Fleet Risk Score**: 0.28 / 1.00 (LOW) ✅
- **Critical Incidents**: 0 in last 30 days ✅
- **Near-Miss Events**: 3 (all documented and addressed)
- **Safety Compliance Rate**: 97.8%

### Risk Categories

| Category | Score | Status | Trend |
|----------|-------|--------|-------|
| Vehicle Mechanical | 0.21 | ✅ Low | Improving |
| Driver Fatigue | 0.32 | ✅ Low | Stable |
| Route Safety | 0.28 | ✅ Low | Improving |
| Weather Impact | 0.35 | ⚠️ Moderate | Seasonal |
| Cargo Security | 0.18 | ✅ Low | Stable |

## Vehicle Risk Analysis

### High-Risk Vehicles (Action Required)
| Vehicle ID | Risk Score | Primary Issue | Action |
|------------|------------|---------------|--------|
| VH-047 | 0.72 | Brake wear >80% | Schedule maintenance |
| VH-089 | 0.65 | Tire tread low | Replace tires |
| VH-112 | 0.58 | Overdue service | Service immediately |

### Fleet Health Distribution
- **Excellent (0-0.3)**: 78% of fleet
- **Good (0.3-0.5)**: 15% of fleet
- **Attention (0.5-0.7)**: 5% of fleet
- **Critical (>0.7)**: 2% of fleet

${customization.includeRecommendations ? `## Mitigation Strategies

1. **Immediate Actions**
   - Schedule maintenance for VH-047, VH-089, VH-112
   - Implement additional driver fatigue monitoring
   - Review weather-adjusted routing protocols

2. **Short-term Improvements (30 days)**
   - Deploy tire pressure monitoring system fleet-wide
   - Enhance driver training on adverse weather conditions
   - Install additional dash cameras in high-risk vehicles

3. **Long-term Initiatives (90 days)**
   - Implement AI-based predictive maintenance
   - Develop comprehensive driver wellness program
   - Establish real-time risk monitoring dashboard

` : ''}## Incident Log

| Date | Type | Severity | Resolution |
|------|------|----------|------------|
| Jan 15 | Minor collision | Low | Insurance claim filed |
| Jan 12 | Near-miss | Low | Driver retrained |
| Jan 08 | Mechanical failure | Medium | Vehicle repaired |

---
*Generated by Logistics AI Platform | Powered by Gemini*
*Report Date: ${new Date().toLocaleDateString()} | Classification: Confidential*`,

      fairness_audit: `# Fairness Audit Report

${customization.includeSummary ? `## Executive Summary

This fairness audit evaluates equity and bias across our logistics operations for **${currentDate}**. Our commitment to fair operations extends to geographic coverage, driver treatment, and customer service equity.

> **Overall Equity Score: 0.86** - Operations demonstrate strong fairness across all measured dimensions.

` : ''}## Fairness Metrics Overview

### Key Indicators
- **Geographic Equity Score**: 0.86 ✅
- **Driver Workload Gini Coefficient**: 0.24 (Fair Distribution) ✅
- **Customer Segment Parity**: Achieved ✅
- **Service Level Consistency**: 94.2%

## Geographic Analysis

### Coverage Equity by Zone

| Zone | Coverage | Avg Wait Time | Service Level | Equity Score |
|------|----------|---------------|---------------|--------------|
| Downtown | 98% | 28 min | 96% | 0.94 ✅ |
| Industrial | 95% | 32 min | 94% | 0.89 ✅ |
| Residential N | 92% | 35 min | 91% | 0.85 ✅ |
| Residential S | 89% | 38 min | 88% | 0.78 ⚠️ |
| Suburban | 85% | 42 min | 85% | 0.72 ⚠️ |

### Identified Disparities
- Suburban areas show 15% longer average delivery times
- Southern residential zones have lower fleet coverage during peak hours
- Premium service adoption varies by neighborhood income level

## Driver Workload Analysis

### Distribution Metrics
- **Standard Deviation**: 12.3 deliveries/day
- **Max/Min Ratio**: 1.8 (Healthy range: <2.0) ✅
- **Overtime Distribution**: Evenly spread across team
- **Route Difficulty Balance**: 0.91 fairness score

### Driver Equity Breakdown

| Metric | Score | Status |
|--------|-------|--------|
| Shift Assignment | 0.92 | ✅ Fair |
| Route Difficulty | 0.88 | ✅ Fair |
| Earnings Opportunity | 0.85 | ✅ Fair |
| Break Compliance | 0.96 | ✅ Fair |

${customization.includeRecommendations ? `## Recommendations

1. **Improve Suburban Coverage**
   - Deploy 2 additional vehicles to suburban routes
   - Adjust shift schedules to cover peak demand hours
   - Consider micro-depot in southern suburban area

2. **Enhance Driver Equity**
   - Implement rotation for high-demand routes
   - Balance overtime opportunities across all drivers
   - Review route assignment algorithm for bias

3. **Customer Segment Parity**
   - Extend premium service availability to all zones
   - Standardize service guarantees across segments
   - Monitor for pricing disparities by location

` : ''}---
*Generated by Logistics AI Platform | Powered by Gemini*
*Report Date: ${new Date().toLocaleDateString()} | Classification: Internal*`,

      ethical_compliance: `# Ethical Compliance Report

${customization.includeSummary ? `## Executive Summary

This report assesses our alignment with ethical frameworks and compliance standards for **${currentDate}**. Our operations are evaluated against utilitarian, deontological, virtue ethics, and care ethics principles.

> **Overall Ethical Compliance Score: 91%** - Strong alignment with ethical principles across all frameworks.

` : ''}## Ethical Framework Alignment

### Framework Scores

| Framework | Score | Description | Status |
|-----------|-------|-------------|--------|
| Utilitarian | 88% | Greatest good for greatest number | ✅ |
| Deontological | 92% | Duty-based decision making | ✅ |
| Virtue Ethics | 89% | Character-driven choices | ✅ |
| Care Ethics | 94% | Relationship-centered approach | ✅ |

## Decision Audit

### Recent Ethical Decisions

1. **Resource Allocation Dilemma** (Jan 15)
   - Decision: Prioritized medical deliveries during vehicle shortage
   - Framework Alignment: Care Ethics (94%), Utilitarian (85%)
   - Outcome: Successfully balanced urgent needs

2. **Driver Fatigue Protocol** (Jan 12)
   - Decision: Implemented mandatory rest despite delivery delays
   - Framework Alignment: Deontological (96%), Care (92%)
   - Outcome: Zero fatigue-related incidents

3. **Data Privacy Enhancement** (Jan 10)
   - Decision: Opt-in only tracking with full transparency
   - Framework Alignment: All frameworks >90%
   - Outcome: Increased customer trust

## Stakeholder Impact Analysis

### Impact by Stakeholder Group

| Stakeholder | Positive Impact | Negative Impact | Net Score |
|-------------|-----------------|-----------------|-----------|
| Drivers | Safety, fair pay | Stricter monitoring | +0.72 |
| Customers | Better service | Occasional delays | +0.85 |
| Community | Less congestion | Traffic increase | +0.45 |
| Shareholders | Sustainable growth | Short-term costs | +0.68 |

${customization.includeCompliance ? `## Regulatory Compliance

| Regulation | Status | Last Review | Next Audit |
|------------|--------|-------------|------------|
| GDPR/Privacy | ✅ Compliant | Jan 10 | Apr 10 |
| Labor Rights | ✅ Compliant | Jan 15 | Apr 15 |
| Safety Standards | ✅ Compliant | Jan 18 | Apr 18 |
| Environmental | ⚠️ Review Needed | Dec 20 | Mar 20 |

` : ''}${customization.includeRecommendations ? `## Improvement Plan

1. **Enhance Environmental Compliance**
   - Accelerate EV fleet transition
   - Implement carbon offset program
   - Review routing for emission reduction

2. **Strengthen Care Ethics**
   - Expand driver wellness initiatives
   - Improve community engagement
   - Enhance customer communication

3. **Continuous Monitoring**
   - Establish ethics review board
   - Implement decision audit trail
   - Schedule quarterly ethics training

` : ''}---
*Generated by Logistics AI Platform | Powered by Gemini*
*Report Date: ${new Date().toLocaleDateString()} | Classification: Confidential*`,

      sustainability: `# Sustainability Report

${customization.includeSummary ? `## Executive Summary

This sustainability report tracks our environmental impact and green initiatives for **${currentDate}**. We are committed to reducing our carbon footprint while maintaining operational excellence.

> **Carbon Reduction Progress: 23%** toward our 2030 net-zero goal.

` : ''}## Environmental Metrics

### Carbon Footprint

| Category | Current | Target | Progress |
|----------|---------|--------|----------|
| Fleet Emissions | 2,450 tCO2e | 1,900 tCO2e | 72% ⚠️ |
| Facility Energy | 320 tCO2e | 280 tCO2e | 85% ✅ |
| Supply Chain | 890 tCO2e | 750 tCO2e | 78% ⚠️ |
| Total | 3,660 tCO2e | 2,930 tCO2e | 76% |

### EV Fleet Progress

- **Current EV Fleet**: 24 vehicles (15% of total)
- **Target by EOY**: 40 vehicles (25%)
- **Charging Stations**: 12 installed, 8 planned
- **Average EV Range**: 180 miles/charge

## Green Initiatives

### Active Programs

1. **Route Optimization** - 12% emission reduction through AI
2. **Idle Reduction** - Engine auto-shutoff after 3 min
3. **Eco-Driving Training** - 85% driver completion
4. **Solar Panels** - 40% facility power from solar

### Upcoming Initiatives

- Hydrogen fuel cell pilot (Q2)
- Carbon-neutral delivery option (Q3)
- Supplier sustainability audit (Q2)
- Packaging reduction program (Q2)

${customization.includeRecommendations ? `## Recommendations

1. **Accelerate EV Adoption**: Increase fleet electrification to 30% by Q4
2. **Optimize Routes**: Further reduce miles driven by 8%
3. **Green Partnerships**: Partner with eco-friendly suppliers
4. **Carbon Offsets**: Implement verified offset program

` : ''}---
*Generated by Logistics AI Platform | Powered by Gemini*
*Report Date: ${new Date().toLocaleDateString()} | Classification: Public*`,

      stakeholder_brief: `# Stakeholder Executive Brief

${customization.includeSummary ? `## Executive Summary

This executive brief summarizes key operational highlights and strategic initiatives for **${currentDate}**. Our focus remains on sustainable growth, operational excellence, and stakeholder value creation.

> **Key Message**: Strong Q1 performance with 18% efficiency gains and expanding market presence.

` : ''}## Performance Highlights

### Key Achievements

- **Revenue Growth**: +12% YoY
- **Operational Efficiency**: +18% improvement
- **Customer Satisfaction**: 4.6/5.0 (↑0.3)
- **Market Share**: 23% (↑2%)

### Strategic Metrics

| KPI | Target | Actual | Status |
|-----|--------|--------|--------|
| On-Time Delivery | 90% | 94.2% | ✅ Exceeded |
| Cost per Delivery | $10.00 | $8.47 | ✅ Exceeded |
| Fleet Utilization | 85% | 87% | ✅ Exceeded |
| Safety Score | 95% | 97.8% | ✅ Exceeded |

## Strategic Initiatives

### In Progress

1. **AI-Powered Optimization** - 78% complete
2. **EV Fleet Expansion** - 45% complete
3. **New Market Entry** - Planning phase
4. **Digital Platform Upgrade** - 60% complete

### Planned for Next Quarter

- Launch sustainability dashboard
- Expand to 3 new service areas
- Deploy advanced analytics platform
- Implement customer loyalty program

## Risk Summary

| Risk Area | Level | Mitigation |
|-----------|-------|------------|
| Market Competition | Medium | Innovation focus |
| Regulatory Changes | Low | Proactive compliance |
| Supply Chain | Low | Diversified vendors |
| Talent Retention | Medium | Enhanced benefits |

---
*Generated by Logistics AI Platform | Powered by Gemini*
*Report Date: ${new Date().toLocaleDateString()} | Classification: Board Confidential*`,

      fleet_performance: `# Fleet Performance Report

${customization.includeSummary ? `## Executive Summary

Comprehensive fleet performance analysis for **${currentDate}**. This report covers vehicle health, driver metrics, and maintenance insights to optimize fleet operations.

> **Fleet Health Score: 92%** - Fleet operating at optimal performance levels.

` : ''}## Fleet Overview

### Fleet Composition

| Category | Count | Active | Utilization |
|----------|-------|--------|-------------|
| Delivery Vans | 85 | 82 | 89% |
| Box Trucks | 42 | 40 | 85% |
| Electric Vehicles | 24 | 24 | 94% |
| Refrigerated | 12 | 11 | 82% |
| **Total** | **163** | **157** | **87%** |

### Vehicle Health Distribution

- **Excellent (A)**: 68% of fleet
- **Good (B)**: 22% of fleet
- **Fair (C)**: 8% of fleet
- **Needs Attention (D)**: 2% of fleet

## Driver Performance

### Top Performers

| Driver | Efficiency | Safety | Customer Rating |
|--------|-----------|--------|-----------------|
| Ahmad K. | 98% | 100% | 4.9 |
| Sarah M. | 96% | 100% | 4.8 |
| John D. | 95% | 98% | 4.8 |
| Maria L. | 94% | 100% | 4.7 |

### Driver Metrics

- **Average Deliveries/Day**: 28
- **Average Drive Time**: 6.2 hours
- **Safety Violations**: 0.02 per 1000 miles
- **Customer Complaints**: 0.3%

${customization.includeRecommendations ? `## Optimization Recommendations

1. **Vehicle Rotation**: Redistribute high-mileage vehicles
2. **Maintenance Schedule**: Adjust PM intervals based on usage patterns
3. **Route Assignment**: Match vehicle capabilities to route requirements
4. **Training Focus**: Advanced eco-driving techniques

` : ''}---
*Generated by Logistics AI Platform | Powered by Gemini*
*Report Date: ${new Date().toLocaleDateString()} | Classification: Internal*`,

      quarterly_review: `# Q1 2026 Business Review

${customization.includeSummary ? `## Executive Summary

Quarterly business review for **Q1 ${new Date().getFullYear()}**. This comprehensive analysis covers financial performance, operational metrics, and strategic progress.

> **Quarter Highlight**: Achieved record efficiency gains while expanding service coverage by 15%.

` : ''}## Quarter Performance

### Financial Highlights

| Metric | Q1 Target | Q1 Actual | Variance |
|--------|-----------|-----------|----------|
| Revenue | $12.5M | $13.2M | +5.6% ✅ |
| Gross Margin | 32% | 34.2% | +2.2pp ✅ |
| Operating Cost | $8.5M | $8.1M | -4.7% ✅ |
| EBITDA | $2.8M | $3.4M | +21.4% ✅ |

### Operational KPIs

| KPI | Target | Actual | Status |
|-----|--------|--------|--------|
| Deliveries | 450K | 478K | ✅ +6.2% |
| On-Time Rate | 90% | 94.2% | ✅ Exceeded |
| Customer NPS | 45 | 52 | ✅ Exceeded |
| Employee Satisfaction | 75% | 78% | ✅ Exceeded |

## Strategic Progress

### Completed Initiatives

1. ✅ AI Route Optimization - 18% efficiency gain
2. ✅ Real-time Tracking - 100% fleet coverage
3. ✅ Mobile App 2.0 - Launched Feb 15
4. ✅ New Distribution Center - Operational Mar 1

### In Progress

- EV Fleet Expansion (45% complete)
- Predictive Analytics Platform (60% complete)
- Sustainability Dashboard (80% complete)

## Challenges & Learnings

### Key Challenges

1. **Supply Chain Delays**: 15-day average parts delay
2. **Driver Shortage**: 8% below target headcount
3. **Fuel Costs**: 12% above budget

### Mitigation Actions

- Diversified parts suppliers
- Enhanced recruitment campaign
- Accelerated EV adoption

## Q2 Objectives

1. Expand to 3 new service areas
2. Increase EV fleet to 30%
3. Launch customer loyalty program
4. Achieve 95% on-time delivery rate
5. Reduce cost per delivery by 5%

---
*Generated by Logistics AI Platform | Powered by Gemini*
*Report Date: ${new Date().toLocaleDateString()} | Classification: Board Confidential*`
    };
    
    return contentMap[templateId] || '';
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    
    setIsGenerating(true);
    setDisplayedContent('');
    
    // Simulate AI generation with typing effect
    await new Promise(r => setTimeout(r, 800));
    
    const content = generateContent(selectedTemplate);
    setGeneratedContent(content);
    setDocumentName(templates.find(t => t.id === selectedTemplate)?.name || 'Document');
    
    // Fast typing animation
    const chunkSize = 20;
    for (let i = 0; i <= content.length; i += chunkSize) {
      await new Promise(r => setTimeout(r, 10));
      setDisplayedContent(content.slice(0, i));
    }
    setDisplayedContent(content);
    
    // Add to history
    const newDoc: DocumentHistory = {
      id: Date.now().toString(),
      templateId: selectedTemplate,
      name: templates.find(t => t.id === selectedTemplate)?.name || 'Document',
      createdAt: new Date(),
      content: content
    };
    setDocumentHistory(prev => [newDoc, ...prev.slice(0, 9)]);
    
    setIsGenerating(false);
  };

  // PDF Export using print
  const handleExportPDF = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${documentName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #1a1a2e;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 { 
              font-size: 28px; 
              color: #1a1a2e; 
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 3px solid #00f5ff;
            }
            h2 { 
              font-size: 20px; 
              color: #6366f1; 
              margin: 25px 0 15px;
            }
            h3 { 
              font-size: 16px; 
              color: #8b5cf6; 
              margin: 20px 0 10px;
            }
            p { margin: 10px 0; color: #374151; }
            ul, ol { margin: 10px 0 10px 20px; color: #374151; }
            li { margin: 5px 0; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 15px 0;
              font-size: 14px;
            }
            th, td { 
              border: 1px solid #e5e7eb; 
              padding: 10px; 
              text-align: left;
            }
            th { 
              background: #f3f4f6; 
              font-weight: 600;
              color: #1a1a2e;
            }
            tr:nth-child(even) { background: #f9fafb; }
            blockquote {
              border-left: 4px solid #00f5ff;
              padding-left: 15px;
              margin: 15px 0;
              color: #6b7280;
              font-style: italic;
            }
            strong { color: #1a1a2e; }
            code { 
              background: #f3f4f6; 
              padding: 2px 6px; 
              border-radius: 4px;
              font-family: monospace;
            }
            hr { 
              border: none; 
              border-top: 1px solid #e5e7eb; 
              margin: 30px 0;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #9ca3af;
              text-align: center;
            }
            @media print {
              body { padding: 20px; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          ${convertMarkdownToHTML(generatedContent)}
          <div class="footer">
            Generated by Logistics AI Platform | ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  // Convert markdown to HTML for PDF
  const convertMarkdownToHTML = (markdown: string): string => {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');
    
    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.+<\/li>\n?)+/g, '<ul>$&</ul>');
    
    // Numbered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    
    // Tables
    const tableRegex = /(\|.+\|[\r\n]+)+/g;
    html = html.replace(tableRegex, (match) => {
      const rows = match.trim().split('\n').filter(row => row.trim());
      if (rows.length < 2) return match;
      
      const headerRow = rows[0];
      const dataRows = rows.slice(2); // Skip separator row
      
      const headers = headerRow.split('|').filter(cell => cell.trim());
      const headerHtml = headers.map(h => `<th>${h.trim()}</th>`).join('');
      
      const bodyHtml = dataRows.map(row => {
        const cells = row.split('|').filter(cell => cell.trim());
        return `<tr>${cells.map(c => `<td>${c.trim().replace(/✅/g, '✓').replace(/⚠️/g, '⚠').replace(/❌/g, '✗')}</td>`).join('')}</tr>`;
      }).join('');
      
      return `<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
    });
    
    // Paragraphs (lines that aren't already HTML)
    html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, '<p>$1</p>');
    
    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');
    
    return html;
  };

  // Copy to clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <PageLayout>
      <div className="min-h-screen bg-dark-900 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Policy Brief <span className="bg-gradient-to-r from-accent-magenta to-accent-purple bg-clip-text text-transparent">Generator</span>
              </h1>
              <p className="text-gray-400">
                AI-powered document synthesis with intelligent analysis
              </p>
            </div>
            
            {generatedContent && (
              <div className="flex items-center gap-3">
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-magenta to-accent-purple rounded-lg text-white font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* KPI Dashboard */}
        <div className="mb-4">
          <PolicyKPIDashboard
            documentsGenerated={documentHistory.length + 47}
            templatesUsed={new Set(documentHistory.map(d => d.templateId)).size + 6}
            exportCount={23}
            avgGenerationTime={2.3}
            complianceCoverage={94}
            qualityScore={8.7}
          />
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Template Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-4 space-y-6"
          >
            {/* Templates */}
            <div className="glass-dark rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent-magenta" />
                Templates
                <span className="ml-auto text-xs bg-dark-600 px-2 py-1 rounded-full text-gray-400">
                  {templates.length} available
                </span>
              </h3>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {templates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <motion.button
                      key={template.id}
                      whileHover={{ scale: 1.01, x: 4 }}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={cn(
                        'w-full p-3 rounded-xl text-left transition-all relative overflow-hidden',
                        selectedTemplate === template.id
                          ? 'bg-gradient-to-r from-accent-magenta/20 to-accent-purple/20 border border-accent-magenta'
                          : 'bg-dark-700 border border-transparent hover:bg-dark-600'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${template.color}15` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: template.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white text-sm truncate">{template.name}</p>
                            <span 
                              className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: `${template.color}20`, color: template.color }}
                            >
                              {template.category}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 truncate">{template.description}</p>
                        </div>
                        <ChevronRight className={cn(
                          'w-4 h-4 text-gray-500 transition-transform flex-shrink-0',
                          selectedTemplate === template.id && 'text-accent-magenta rotate-90'
                        )} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Customization Options */}
            <AnimatePresence>
              {selectedTemplate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-dark rounded-2xl p-6"
                >
                  <button
                    onClick={() => setShowCustomization(!showCustomization)}
                    className="w-full flex items-center justify-between mb-4"
                  >
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-accent-cyan" />
                      Customize Report
                    </h3>
                    <ChevronRight className={cn(
                      'w-5 h-5 text-gray-400 transition-transform',
                      showCustomization && 'rotate-90'
                    )} />
                  </button>
                  
                  <AnimatePresence>
                    {showCustomization && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        {/* Toggles */}
                        <div className="space-y-3">
                          {[
                            { key: 'includeSummary', label: 'Executive Summary' },
                            { key: 'includeCharts', label: 'Charts & Tables' },
                            { key: 'includeRecommendations', label: 'Recommendations' },
                            { key: 'includeCompliance', label: 'Compliance Status' }
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center justify-between cursor-pointer">
                              <span className="text-sm text-gray-400">{label}</span>
                              <button
                                onClick={() => setCustomization(prev => ({ ...prev, [key]: !prev[key as keyof CustomizationOptions] }))}
                                className={cn(
                                  'w-10 h-5 rounded-full transition-all relative',
                                  customization[key as keyof CustomizationOptions] ? 'bg-accent-cyan' : 'bg-dark-600'
                                )}
                              >
                                <div className={cn(
                                  'w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all',
                                  customization[key as keyof CustomizationOptions] ? 'left-5' : 'left-0.5'
                                )} />
                              </button>
                            </label>
                          ))}
                        </div>
                        
                        {/* Detail Level */}
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Detail Level</p>
                          <div className="flex gap-2">
                            {(['summary', 'standard', 'detailed'] as const).map(level => (
                              <button
                                key={level}
                                onClick={() => setCustomization(prev => ({ ...prev, detailLevel: level }))}
                                className={cn(
                                  'flex-1 py-2 text-xs rounded-lg font-medium transition-all capitalize',
                                  customization.detailLevel === level
                                    ? 'bg-accent-cyan text-dark-900'
                                    : 'bg-dark-600 text-gray-400 hover:bg-dark-500'
                                )}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Generate Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={cn(
                      'w-full mt-4 py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all',
                      isGenerating
                        ? 'bg-dark-600 text-gray-400'
                        : 'bg-gradient-to-r from-accent-magenta via-accent-purple to-accent-cyan text-white shadow-lg shadow-accent-magenta/20'
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <RefreshCw className="w-5 h-5" />
                        </motion.div>
                        Generating with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Report
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent Documents */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-dark rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent-orange" />
                Recent Documents
              </h3>
              <div className="space-y-2">
                {documentHistory.slice(0, 5).map((doc) => {
                  const template = templates.find(t => t.id === doc.templateId);
                  return (
                    <motion.div
                      key={doc.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-3 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600 transition-all"
                      onClick={() => {
                        if (doc.content) {
                          setGeneratedContent(doc.content);
                          setDisplayedContent(doc.content);
                          setDocumentName(doc.name);
                          setSelectedTemplate(doc.templateId);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${template?.color || '#00f5ff'}15` }}
                        >
                          <CheckCircle className="w-4 h-4" style={{ color: template?.color || '#00f5ff' }} />
                        </div>
                        <div>
                          <span className="text-sm text-white block">{doc.name}</span>
                          <span className="text-xs text-gray-500">{template?.category}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{formatTimeAgo(doc.createdAt)}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>

          {/* Document Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-8"
          >
            <div className="glass-dark rounded-2xl p-6 h-full flex flex-col">
              {/* Preview Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-dark-600">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-accent-cyan" />
                  {editingName && generatedContent ? (
                    <input
                      type="text"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      onBlur={() => setEditingName(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
                      autoFocus
                      className="bg-dark-700 px-3 py-1 rounded-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                    />
                  ) : (
                    <h3 
                      className="text-lg font-semibold text-white flex items-center gap-2 cursor-pointer hover:text-accent-cyan transition-colors"
                      onClick={() => generatedContent && setEditingName(true)}
                    >
                      {generatedContent ? documentName : 'Document Preview'}
                      {generatedContent && <Edit3 className="w-4 h-4 text-gray-500" />}
                    </h3>
                  )}
                </div>
                
                {generatedContent && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 mr-2">
                      {generatedContent.length.toLocaleString()} characters
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={handleGenerate}
                      className="p-2 bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => {
                        setGeneratedContent('');
                        setDisplayedContent('');
                        setDocumentName('');
                      }}
                      className="p-2 bg-dark-700 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                      title="Clear"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </div>
              
              {/* Content Area */}
              <div 
                ref={contentRef}
                className="bg-dark-800 rounded-xl p-6 flex-1 overflow-y-auto min-h-[calc(100vh-300px)]"
              >
                {displayedContent ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <MarkdownRenderer content={displayedContent} />
                    {isGenerating && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="inline-block w-2 h-5 bg-accent-magenta ml-1"
                      />
                    )}
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <FileText className="w-20 h-20 mb-6 opacity-30" />
                    </motion.div>
                    <p className="text-lg mb-2">Select a template to begin</p>
                    <p className="text-sm text-gray-600">
                      Choose from {templates.length} professional report templates
                    </p>
                    
                    {/* Quick Start Cards */}
                    <div className="grid grid-cols-4 gap-3 mt-8 w-full max-w-2xl">
                      {templates.slice(0, 4).map(template => {
                        const Icon = template.icon;
                        return (
                          <motion.button
                            key={template.id}
                            whileHover={{ scale: 1.05, y: -4 }}
                            onClick={() => setSelectedTemplate(template.id)}
                            className="p-4 bg-dark-700 rounded-xl flex flex-col items-center gap-2 hover:bg-dark-600 transition-all"
                          >
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${template.color}15` }}
                            >
                              <Icon className="w-5 h-5" style={{ color: template.color }} />
                            </div>
                            <span className="text-xs text-gray-400 text-center">{template.name.split(' ')[0]}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row - Template Gauges, Document Feed, Compliance */}
        <div className="grid grid-cols-12 gap-6 mt-6">
          <div className="col-span-4">
            <TemplateGauges
              operational={82}
              safety={78}
              ethics={85}
              sustainability={71}
            />
          </div>
          <div className="col-span-4">
            <DocumentFeed />
          </div>
          <div className="col-span-4">
            <ComplianceIndicator
              regulations={[
                { name: 'GDPR', status: 'compliant', score: 98, lastAudit: '2 days ago' },
                { name: 'ISO 27001', status: 'compliant', score: 95, lastAudit: '1 week ago' },
                { name: 'SOC 2', status: 'review', score: 87, lastAudit: '3 days ago' },
                { name: 'HIPAA', status: 'pending', score: 72, lastAudit: 'Pending' }
              ]}
              overallScore={88}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
