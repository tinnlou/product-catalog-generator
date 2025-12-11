'use client';

// ============================================================================
// AuditLogSidebar - 审计日志侧边栏
// 
// 功能:
// 1. 显示当前产品/实体的所有历史变更
// 2. 支持按时间/操作类型筛选
// 3. 可展开查看详细变更内容
// 4. 支持回滚到历史版本 (可选)
// ============================================================================

import React, { useState } from 'react';
import { 
  History, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  User, 
  Clock, 
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Upload,
  Download,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { AuditLogEntry, AuditAction } from '@/types/schema';

// ============================================================================
// 类型定义
// ============================================================================

interface AuditLogSidebarProps {
  logs: AuditLogEntry[];
  entityType?: string;
  entityId?: string;
  isLoading?: boolean;
  onRestore?: (log: AuditLogEntry) => void;
}

// ============================================================================
// 操作类型配置
// ============================================================================

const ACTION_CONFIG: Record<AuditAction, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}> = {
  CREATE: {
    label: '创建',
    icon: Plus,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  UPDATE: {
    label: '更新',
    icon: Edit,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  DELETE: {
    label: '删除',
    icon: Trash2,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  PUBLISH: {
    label: '发布',
    icon: Upload,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  UNPUBLISH: {
    label: '取消发布',
    icon: Download,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  RESTORE: {
    label: '恢复',
    icon: RotateCcw,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
  BULK_UPDATE: {
    label: '批量更新',
    icon: Layers,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
};

// ============================================================================
// 单条日志组件
// ============================================================================

interface LogEntryProps {
  log: AuditLogEntry;
  onRestore?: (log: AuditLogEntry) => void;
}

function LogEntry({ log, onRestore }: LogEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const config = ACTION_CONFIG[log.action];
  const ActionIcon = config.icon;

  const hasValueChanges = log.previousValue !== undefined || log.newValue !== undefined;

  return (
    <div className="border-l-2 border-slate-200 pl-4 pb-4 relative">
      {/* 时间线节点 */}
      <div className={`absolute -left-2 top-0 w-4 h-4 rounded-full ${config.bgColor} flex items-center justify-center`}>
        <ActionIcon className={`w-2.5 h-2.5 ${config.color}`} />
      </div>

      {/* 日志头部 */}
      <div 
        className={`cursor-pointer ${hasValueChanges ? 'hover:bg-slate-50' : ''} rounded-lg p-2 -ml-2 transition-colors`}
        onClick={() => hasValueChanges && setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* 操作描述 */}
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${config.color}`}>
                {config.label}
              </span>
              {log.fieldName && (
                <>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-sm text-slate-700 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                    {log.fieldName}
                  </span>
                </>
              )}
            </div>

            {/* 摘要 */}
            {log.summary && (
              <p className="text-sm text-slate-600 mt-1">{log.summary}</p>
            )}

            {/* 元信息 */}
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              {log.userName && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {log.userName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(log.timestamp), { 
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
            </div>
          </div>

          {/* 展开箭头 */}
          {hasValueChanges && (
            <div className="ml-2 mt-1">
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* 展开的详细内容 */}
      {expanded && hasValueChanges && (
        <div className="mt-3 space-y-3 ml-2">
          {/* 变更对比 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 旧值 */}
            {log.previousValue !== undefined && (
              <div>
                <div className="text-xs font-medium text-slate-500 mb-1">变更前</div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs font-mono overflow-auto max-h-40">
                  <pre className="text-red-700 whitespace-pre-wrap">
                    {typeof log.previousValue === 'object' 
                      ? JSON.stringify(log.previousValue, null, 2)
                      : String(log.previousValue)
                    }
                  </pre>
                </div>
              </div>
            )}

            {/* 新值 */}
            {log.newValue !== undefined && (
              <div>
                <div className="text-xs font-medium text-slate-500 mb-1">变更后</div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs font-mono overflow-auto max-h-40">
                  <pre className="text-green-700 whitespace-pre-wrap">
                    {typeof log.newValue === 'object'
                      ? JSON.stringify(log.newValue, null, 2)
                      : String(log.newValue)
                    }
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* 恢复按钮 */}
          {onRestore && log.action === 'UPDATE' && log.previousValue !== undefined && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRestore(log);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-orange-600 hover:bg-orange-50 border border-orange-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              恢复到此版本
            </button>
          )}

          {/* 详细时间 */}
          <div className="text-xs text-slate-400">
            {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 主组件: AuditLogSidebar
// ============================================================================

export function AuditLogSidebar({
  logs,
  entityType,
  entityId,
  isLoading = false,
  onRestore,
}: AuditLogSidebarProps) {
  const [filterAction, setFilterAction] = useState<AuditAction | 'all'>('all');
  const [showFilter, setShowFilter] = useState(false);

  // 筛选日志
  const filteredLogs = filterAction === 'all'
    ? logs
    : logs.filter((log) => log.action === filterAction);

  // 按日期分组
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, AuditLogEntry[]>);

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200">
      {/* 头部 */}
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">修改历史</h3>
          </div>
          
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`p-1.5 rounded-lg transition-colors ${
              showFilter ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* 筛选面板 */}
        {showFilter && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-xs font-medium text-slate-500 mb-2">按操作类型筛选</div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilterAction('all')}
                className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                  filterAction === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                全部
              </button>
              {(Object.keys(ACTION_CONFIG) as AuditAction[]).map((action) => {
                const config = ACTION_CONFIG[action];
                return (
                  <button
                    key={action}
                    onClick={() => setFilterAction(action)}
                    className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                      filterAction === action
                        ? `${config.bgColor} ${config.color}`
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 统计信息 */}
        <div className="mt-2 text-xs text-slate-500">
          共 {filteredLogs.length} 条记录
          {entityType && ` · ${entityType}`}
        </div>
      </div>

      {/* 日志列表 */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无修改记录</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date}>
                {/* 日期标题 */}
                <div className="sticky top-0 bg-white pb-2 z-10">
                  <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block">
                    {format(new Date(date), 'M月d日 EEEE', { locale: zhCN })}
                  </div>
                </div>

                {/* 当日日志 */}
                <div className="space-y-0 mt-3">
                  {groupedLogs[date].map((log) => (
                    <LogEntry 
                      key={log.id} 
                      log={log} 
                      onRestore={onRestore}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLogSidebar;

