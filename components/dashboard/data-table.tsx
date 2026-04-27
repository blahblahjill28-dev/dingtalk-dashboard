// 数据表格组件

import { useState } from 'react';

interface SheetData {
  id: string;
  name: string;
  fields: Array<{ id: string; name: string; type: string }>;
  records: Record<string, any>[];
  totalCount: number;
}

interface DataTableProps {
  sheet: SheetData;
}

export function DataTable({ sheet }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 50;

  // 搜索过滤
  const filteredRecords = sheet.records.filter(record => {
    if (!searchTerm) return true;
    return Object.values(record).some(
      value => String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // 分页
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 获取所有列名
  const columns = sheet.fields.length > 0
    ? sheet.fields.map(f => f.name)
    : filteredRecords.length > 0
      ? Object.keys(filteredRecords[0]).filter(k => k !== 'id')
      : [];

  return (
    <div className="space-y-4">
      {/* 表头 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {sheet.name}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({filteredRecords.length} 条记录)
          </span>
        </h3>
        
        {/* 搜索框 */}
        <input
          type="text"
          placeholder="搜索..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              {columns.map(col => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  暂无数据
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record, idx) => (
                <tr key={record.id || idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>
                  {columns.map(col => (
                    <td
                      key={col}
                      className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                    >
                      {formatCellValue(record[col])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            第 {currentPage} / {totalPages} 页
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 格式化单元格值
function formatCellValue(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
