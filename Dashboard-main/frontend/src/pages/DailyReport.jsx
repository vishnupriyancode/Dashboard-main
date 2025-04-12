import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Table, Statistic, Row, Col, Upload, message } from 'antd';
import { UploadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const DailyReport = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [previousMetrics, setPreviousMetrics] = useState(null);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'claims', label: 'Claims' },
    { value: 'payments', label: 'Payments' },
    { value: 'eligibility', label: 'Eligibility' },
  ];

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: categories.slice(1).map(cat => ({ text: cat.label, value: cat.value })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Success', value: 'success' },
        { text: 'Failed', value: 'failed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Response Time (ms)',
      dataIndex: 'responseTime',
      key: 'responseTime',
      sorter: (a, b) => a.responseTime - b.responseTime,
    },
  ];

  const calculateMetrics = (dataSet) => {
    const totalRequests = dataSet.length;
    const successfulRequests = dataSet.filter(item => item.status === 'success').length;
    const failedRequests = totalRequests - successfulRequests;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
    const avgResponseTime = dataSet.reduce((acc, item) => acc + item.responseTime, 0) / totalRequests || 0;

    return {
      totalRequests,
      successRate,
      avgResponseTime,
      failedRequests,
    };
  };

  const calculateComparison = (current, previous) => {
    if (!previous) return null;
    
    return {
      totalRequests: ((current.totalRequests - previous.totalRequests) / previous.totalRequests * 100) || 0,
      successRate: current.successRate - previous.successRate,
      avgResponseTime: ((current.avgResponseTime - previous.avgResponseTime) / previous.avgResponseTime * 100) || 0,
      failedRequests: ((current.failedRequests - previous.failedRequests) / previous.failedRequests * 100) || 0,
    };
  };

  // Calculate previous day's metrics whenever data changes
  useEffect(() => {
    if (data.length > 0) {
      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get yesterday's date at midnight
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Filter data for previous day
      const previousDayData = data.filter(item => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === yesterday.getTime();
      });

      // Set previous metrics
      setPreviousMetrics(calculateMetrics(previousDayData));
    }
  }, [data]);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Transform dates to consistent format
      const transformedData = jsonData.map((item, index) => ({
        key: index,
        date: dayjs(item.date).format('YYYY-MM-DD'),
        category: item.category,
        status: item.status,
        responseTime: item.responseTime,
      }));
      
      setData(transformedData);
      setFilteredData(transformedData);
      
      message.success('File uploaded successfully');
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const applyFilters = () => {
    let filtered = [...data];
    
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      // Get previous period for comparison
      const daysDiff = endDate.diff(startDate, 'days');
      const previousStartDate = startDate.subtract(daysDiff, 'days');
      const previousEndDate = startDate.subtract(1, 'days');

      // Filter data for current period
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.date);
        return itemDate.isAfter(startDate) && itemDate.isBefore(endDate);
      });

      // Calculate metrics for previous period
      const previousPeriodData = data.filter(item => {
        const itemDate = dayjs(item.date);
        return itemDate.isAfter(previousStartDate) && itemDate.isBefore(previousEndDate);
      });
      setPreviousMetrics(calculateMetrics(previousPeriodData));
    }
    
    setFilteredData(filtered);
  };

  const currentMetrics = calculateMetrics(filteredData);
  const comparison = calculateComparison(currentMetrics, previousMetrics);

  const renderComparisonValue = (value, inverse = false) => {
    if (!value && value !== 0) return null;
    const isPositive = inverse ? value <= 0 : value >= 0;
    const color = isPositive ? '#3f8600' : '#cf1322';
    const prefix = value >= 0 ? '+' : '';
    
    return (
      <div style={{ 
        position: 'absolute',
        bottom: '8px',
        right: '24px',
        fontSize: '14px',
        color: color,
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        {prefix}{Math.abs(value).toFixed(1)}%
      </div>
    );
  };

  return (
    <div className="p-6">
      <Card title="Daily Report" className="mb-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-4">
            <Upload
              beforeUpload={handleFileUpload}
              accept=".xlsx,.xls"
              showUploadList={false}
            >
              <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2">
                <UploadOutlined /> Upload Excel File
              </button>
            </Upload>
            
            <Select
              placeholder="Select Category"
              style={{ width: 200 }}
              options={categories}
              onChange={(value) => {
                setSelectedCategory(value);
                applyFilters();
              }}
            />
            
            <RangePicker
              onChange={(dates) => {
                setDateRange(dates);
                applyFilters();
              }}
            />
          </div>
        </div>

        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card bodyStyle={{ position: 'relative', paddingBottom: '32px' }}>
              <Statistic
                title="Total Requests"
                value={currentMetrics.totalRequests}
                precision={0}
              />
              {comparison && renderComparisonValue(comparison.totalRequests)}
            </Card>
          </Col>
          <Col span={6}>
            <Card bodyStyle={{ position: 'relative', paddingBottom: '32px' }}>
              <Statistic
                title="Success Rate"
                value={currentMetrics.successRate}
                precision={2}
                suffix="%"
              />
              {comparison && renderComparisonValue(comparison.successRate)}
            </Card>
          </Col>
          <Col span={6}>
            <Card bodyStyle={{ position: 'relative', paddingBottom: '32px' }}>
              <Statistic
                title="Average Response Time"
                value={currentMetrics.avgResponseTime}
                precision={2}
                suffix="ms"
              />
              {comparison && renderComparisonValue(comparison.avgResponseTime, true)}
            </Card>
          </Col>
          <Col span={6}>
            <Card bodyStyle={{ position: 'relative', paddingBottom: '32px' }}>
              <Statistic
                title="Failed Requests"
                value={currentMetrics.failedRequests}
                precision={0}
              />
              {comparison && renderComparisonValue(comparison.failedRequests, true)}
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default DailyReport; 