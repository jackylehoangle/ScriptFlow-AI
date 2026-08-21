/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Script, 
  ScriptData, 
  ScriptFormat, 
  TopicCategory, 
  ChannelDNA, 
  PlatformType 
} from '../types';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { 
  LayoutDashboard, 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart3, 
  Film, 
  FileText, 
  Sparkles, 
  Calendar, 
  Dna, 
  Layers, 
  X, 
  Clock, 
  Video, 
  Target, 
  Zap, 
  ArrowUpRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  scripts: Script[];
  channels?: ChannelDNA[];
  onSelectScript: (script: Script) => void;
}

const FORMAT_CONFIG: Record<ScriptFormat, { label: string; color: string; bg: string }> = {
  short: { label: 'Shorts & TikTok (2 Cột)', color: '#F97316', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  screenplay: { label: 'Kịch Bản Phim (Screenplay)', color: '#6366F1', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  long: { label: 'YouTube Dài (Multi-Chapter)', color: '#3B82F6', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  podcast: { label: 'Podcast & Đàm Thoại', color: '#10B981', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  commercial: { label: 'TVC & Bán Hàng', color: '#EC4899', bg: 'bg-pink-50 text-pink-700 border-pink-200' }
};

const TOPIC_CONFIG: Record<TopicCategory, { label: string; color: string; icon: string }> = {
  finance: { label: 'Tài Chính & Đầu Tư', color: '#10B981', icon: '💰' },
  tech: { label: 'Công Nghệ & AI', color: '#3B82F6', icon: '🤖' },
  business: { label: 'Kinh Doanh & Khởi Nghiệp', color: '#F59E0B', icon: '💼' },
  marketing_sales: { label: 'Marketing & Bán Hàng', color: '#EC4899', icon: '📈' },
  storytelling: { label: 'Kể Chuyện & Đời Sống', color: '#8B5CF6', icon: '📖' },
  education: { label: 'Giáo Dục & Kỹ Năng', color: '#06B6D4', icon: '🎓' },
  lifestyle: { label: 'Phong Cách Sống', color: '#14B8A6', icon: '🌿' },
  entertainment: { label: 'Giải Trí & Viral', color: '#F97316', icon: '🎭' },
  health: { label: 'Sức Khỏe & Thể Thao', color: '#84CC16', icon: '💪' },
  horror_mystery: { label: 'Kỳ Bí & Trinh Thám', color: '#64748B', icon: '🕵️' }
};

export default function DashboardModal({
  isOpen,
  onClose,
  scripts,
  channels = [],
  onSelectScript
}: DashboardModalProps) {
  const [timeRange, setTimeRange] = useState<'all' | '6months' | '30days'>('all');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('all');

  // Parse all scripts data
  const parsedScripts = useMemo(() => {
    return scripts.map(s => {
      let data: ScriptData;
      try {
        data = JSON.parse(s.content);
      } catch (e) {
        data = {
          id: s.id,
          title: s.title,
          format: 'short',
          platform: 'tiktok',
          topic: 'tech',
          tone: 'energetic_viral',
          targetDuration: '60s'
        };
      }
      return {
        id: s.id,
        title: s.title,
        updated_at: s.updated_at || new Date().toISOString(),
        data
      };
    });
  }, [scripts]);

  // Filter scripts based on time and channel
  const filteredScripts = useMemo(() => {
    const now = new Date();
    return parsedScripts.filter(item => {
      // Channel filter
      if (selectedChannelFilter !== 'all') {
        if (item.data.channelId !== selectedChannelFilter) return false;
      }

      // Time filter
      if (timeRange === '30days') {
        const itemDate = new Date(item.updated_at);
        const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 30) return false;
      } else if (timeRange === '6months') {
        const itemDate = new Date(item.updated_at);
        const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 180) return false;
      }

      return true;
    });
  }, [parsedScripts, selectedChannelFilter, timeRange]);

  // 1. Monthly Trends Aggregation
  const monthlyData = useMemo(() => {
    const monthMap: Record<string, { month: string; shorts: number; screenplay: number; total: number }> = {};

    // Generate last 6-12 month keys in chronological order
    const monthsBack = timeRange === '30days' ? 2 : timeRange === '6months' ? 6 : 8;
    const now = new Date();
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `Tháng ${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
      monthMap[key] = { month: key, shorts: 0, screenplay: 0, total: 0 };
    }

    filteredScripts.forEach(item => {
      const d = new Date(item.updated_at);
      const key = `Tháng ${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
      if (!monthMap[key]) {
        monthMap[key] = { month: key, shorts: 0, screenplay: 0, total: 0 };
      }
      monthMap[key].total += 1;
      if (item.data.format === 'screenplay') {
        monthMap[key].screenplay += 1;
      } else {
        monthMap[key].shorts += 1;
      }
    });

    return Object.values(monthMap);
  }, [filteredScripts, timeRange]);

  // 2. Format Distribution (Pie Chart)
  const formatData = useMemo(() => {
    const counts: Record<string, number> = {
      short: 0,
      screenplay: 0,
      long: 0,
      podcast: 0,
      commercial: 0
    };

    filteredScripts.forEach(item => {
      const fmt = item.data.format || 'short';
      counts[fmt] = (counts[fmt] || 0) + 1;
    });

    const total = filteredScripts.length || 1;

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([key, value]) => {
        const conf = FORMAT_CONFIG[key as ScriptFormat] || { label: key, color: '#94A3B8' };
        return {
          key,
          name: conf.label,
          value,
          percentage: Math.round((value / total) * 100),
          color: conf.color
        };
      });
  }, [filteredScripts]);

  // 3. Topic / Niche Popularity (Bar Chart)
  const topicData = useMemo(() => {
    const counts: Record<string, number> = {};

    filteredScripts.forEach(item => {
      const top = item.data.topic || 'tech';
      counts[top] = (counts[top] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([topicKey, count]) => {
        const conf = TOPIC_CONFIG[topicKey as TopicCategory] || { label: topicKey, color: '#3B82F6', icon: '📌' };
        return {
          topicKey,
          name: conf.label,
          count,
          icon: conf.icon,
          color: conf.color
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [filteredScripts]);

  // 4. Overall KPIs
  const totalScripts = filteredScripts.length;
  const totalShots = useMemo(() => {
    return filteredScripts.reduce((acc, item) => {
      if (item.data.shots && Array.isArray(item.data.shots)) {
        return acc + item.data.shots.length;
      }
      if (item.data.screenplayElements) {
        return acc + item.data.screenplayElements.length;
      }
      return acc;
    }, 0);
  }, [filteredScripts]);

  const topNiche = topicData.length > 0 ? topicData[0] : null;
  const topFormat = formatData.length > 0 ? formatData.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), formatData[0]) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] shadow-2xl border border-zinc-100 flex flex-col overflow-hidden text-zinc-900">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-indigo-500 rounded-2xl shadow-md text-white">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Dashboard Thống Kê Sáng Tạo Kịch Bản
                </h2>
                <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-extrabold rounded-full">
                  Analytics & Insights
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Báo cáo tổng quan về số lượng kịch bản, tỷ lệ định dạng và xu hướng chủ đề (Niche)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="px-5 py-3 bg-zinc-50/80 border-b border-zinc-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-zinc-500 font-semibold">
              <Filter size={14} />
              <span>Thời gian:</span>
            </div>
            <div className="inline-flex p-0.5 bg-white border border-zinc-200 rounded-xl shadow-2xs">
              <button
                onClick={() => setTimeRange('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  timeRange === 'all'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setTimeRange('6months')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  timeRange === '6months'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                6 tháng qua
              </button>
              <button
                onClick={() => setTimeRange('30days')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  timeRange === '30days'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                30 ngày gần nhất
              </button>
            </div>
          </div>

          {/* Channel Filter Selector */}
          {channels && channels.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-semibold">Lọc theo Kênh:</span>
              <select
                value={selectedChannelFilter}
                onChange={(e) => setSelectedChannelFilter(e.target.value)}
                className="bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              >
                <option value="all">Tất cả kênh ({channels.length})</option>
                {channels.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icon || '🎬'} {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Scrollable Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* Top KPI Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1 */}
            <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-blue-50/40 border border-indigo-100 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-indigo-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">Tổng Kịch Bản</span>
                <div className="p-1.5 bg-indigo-500/10 rounded-xl">
                  <FileText size={16} />
                </div>
              </div>
              <div className="text-2xl font-black text-indigo-950">
                {totalScripts}
              </div>
              <p className="text-[11px] text-indigo-600/80 mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 size={12} /> Đã sẵn sàng xuất bản
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-4 bg-gradient-to-br from-orange-50/70 to-amber-50/40 border border-orange-100 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-orange-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-900">Định Dạng Chủ Lực</span>
                <div className="p-1.5 bg-orange-500/10 rounded-xl">
                  <Film size={16} />
                </div>
              </div>
              <div className="text-lg font-black text-orange-950 truncate">
                {topFormat ? topFormat.name.split('(')[0].trim() : 'Chưa có'}
              </div>
              <p className="text-[11px] text-orange-600/80 mt-1 font-medium">
                Chiếm {topFormat ? `${topFormat.percentage}% tổng số` : '0%'}
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-4 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-100 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Niche Phổ Biến</span>
                <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                  <Target size={16} />
                </div>
              </div>
              <div className="text-lg font-black text-emerald-950 truncate flex items-center gap-1">
                <span>{topNiche?.icon || '🔥'}</span>
                <span className="truncate">{topNiche ? topNiche.name : 'Chưa có'}</span>
              </div>
              <p className="text-[11px] text-emerald-600/80 mt-1 font-medium">
                {topNiche ? `${topNiche.count} kịch bản thuộc ngách này` : 'Chưa ghi nhận'}
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-4 bg-gradient-to-br from-purple-50/70 to-pink-50/40 border border-purple-100 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-purple-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900">Cảnh / Phân Đoạn</span>
                <div className="p-1.5 bg-purple-500/10 rounded-xl">
                  <Layers size={16} />
                </div>
              </div>
              <div className="text-2xl font-black text-purple-950">
                {totalShots}
              </div>
              <p className="text-[11px] text-purple-600/80 mt-1 font-medium">
                Trung bình {totalScripts > 0 ? (totalShots / totalScripts).toFixed(1) : 0} cảnh / video
              </p>
            </div>
          </div>

          {/* Charts Row 1: Monthly Trend & Format Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Chart 1: Monthly Timeline (Bar / Area Chart) */}
            <div className="lg:col-span-7 bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <TrendingUp size={16} className="text-indigo-600" />
                    Số Lượng Kịch Bản Đã Tạo Theo Tháng
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Tốc độ sản xuất nội dung theo từng mốc thời gian
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                  {monthlyData.reduce((acc, curr) => acc + curr.total, 0)} kịch bản
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        formatter={(value: any, name: any) => [
                          `${value} kịch bản`,
                          name === 'shorts' ? 'Shorts & TikTok' : name === 'screenplay' ? 'Screenplay' : 'Tổng số'
                        ]}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                        formatter={(value) => value === 'shorts' ? 'Shorts & Video ngắn' : value === 'screenplay' ? 'Screenplay Phim' : value}
                      />
                      <Bar dataKey="shorts" fill="#F97316" radius={[4, 4, 0, 0]} name="shorts" />
                      <Bar dataKey="screenplay" fill="#6366F1" radius={[4, 4, 0, 0]} name="screenplay" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                    Chưa có dữ liệu theo tháng
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Format Ratio (Pie Chart) */}
            <div className="lg:col-span-5 bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <PieIcon size={16} className="text-orange-500" />
                    Tỷ Lệ Các Định Dạng
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Phân bổ giữa Shorts, Screenplay, Long-form
                  </p>
                </div>
              </div>

              <div className="h-48 w-full relative flex items-center justify-center">
                {formatData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={formatData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {formatData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                        formatter={(value: any, name: any, item: any) => [`${value} kịch bản (${item.payload.percentage}%)`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-zinc-400">Chưa có kịch bản</div>
                )}
              </div>

              {/* Format Legend List */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-100 text-xs">
                {formatData.map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-zinc-700 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-zinc-900">{item.value} ({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Charts Row 2: Top Topic / Niche Distribution */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <BarChart3 size={16} className="text-emerald-600" />
                  Các Chủ Đề (Niche) Phổ Biến Nhất
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Xếp hạng các ngách nội dung được sáng tạo nhiều nhất trong hệ thống
                </p>
              </div>
            </div>

            {topicData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {topicData.map((item, index) => {
                  const percentOfTotal = Math.round((item.count / totalScripts) * 100);

                  return (
                    <div 
                      key={item.topicKey}
                      className="p-3 bg-zinc-50/80 border border-zinc-200/80 rounded-xl space-y-2 hover:bg-zinc-50 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-zinc-800">
                          <span className="text-base">{item.icon}</span>
                          <span>{item.name}</span>
                        </div>
                        <span className="font-extrabold text-zinc-900 bg-white px-2 py-0.5 rounded-md border border-zinc-200 text-[11px]">
                          {item.count} video
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percentOfTotal}%`, backgroundColor: item.color }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span>Hạng #{index + 1}</span>
                        <span className="font-semibold">{percentOfTotal}% tổng kịch bản</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-400">
                Chưa có dữ liệu phân loại chủ đề
              </div>
            )}
          </div>

          {/* Recent Scripts Table */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Clock size={16} className="text-zinc-600" />
                Danh Sách Kịch Bản Gần Nhất
              </h3>
              <span className="text-xs text-zinc-400">
                Hiển thị {Math.min(filteredScripts.length, 5)} / {filteredScripts.length} kịch bản
              </span>
            </div>

            <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-xl overflow-hidden text-xs">
              {filteredScripts.slice(0, 5).map(s => {
                const fmtConf = FORMAT_CONFIG[s.data.format || 'short'] || FORMAT_CONFIG.short;
                const topConf = TOPIC_CONFIG[s.data.topic || 'tech'] || TOPIC_CONFIG.tech;

                return (
                  <div 
                    key={s.id}
                    onClick={() => {
                      const raw = scripts.find(r => r.id === s.id);
                      if (raw) {
                        onClose();
                        onSelectScript(raw);
                      }
                    }}
                    className="p-3 hover:bg-zinc-50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{topConf.icon}</span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-zinc-900 truncate hover:text-indigo-600 transition-colors">
                          {s.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                          <span>{new Date(s.updated_at).toLocaleDateString('vi-VN')}</span>
                          <span>•</span>
                          <span>{s.data.targetDuration || '60s'}</span>
                          {s.data.channelName && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-600 font-semibold truncate">
                                {s.data.channelName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${fmtConf.bg}`}>
                        {fmtConf.label.split('(')[0].trim()}
                      </span>
                      <div className="p-1 text-zinc-400 hover:text-indigo-600">
                        <ArrowUpRight size={14} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between shrink-0 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" />
            <span>Biểu đồ tự động cập nhật thời gian thực khi bạn lưu hoặc tạo kịch bản mới.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold transition-all"
          >
            Đóng Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
