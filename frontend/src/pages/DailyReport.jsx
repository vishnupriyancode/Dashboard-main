import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Table, Statistic, Row, Col, Upload, message, Button } from 'antd';
import { UploadOutlined, ArrowUpOutlined, ArrowDownOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import './DailyReport.css';

const { RangePicker } = DatePicker;

const DailyReport = () => {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [tempDateRange, setTempDateRange] = useState([null, null]);
  const [previousMetrics, setPreviousMetrics] = useState(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [categories, setCategories] = useState([
    { value: 'all', label: 'All Categories' },
    { value: 'claims', label: 'Claims' },
    { value: 'payments', label: 'Payments' },
    { value: 'eligibility', label: 'Eligibility' },
  ]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const createColumnsFromHeaders = (headers) => {
    return headers.map((header) => {
      const column = {
        title: header,
        dataIndex: header.toLowerCase().replace(/\s+/g, '_'),
        key: header.toLowerCase().replace(/\s+/g, '_'),
        width: 150,
      };

      if (header.toLowerCase().includes('time') || header.toLowerCase().includes('number')) {
        column.sorter = (a, b) => {
          const aVal = parseFloat(a[column.dataIndex]) || 0;
          const bVal = parseFloat(b[column.dataIndex]) || 0;
          return aVal - bVal;
        };
      }

      if (header.toLowerCase().includes('date')) {
        column.sorter = (a, b) => {
          const aDate = a[column.dataIndex] ? new Date(a[column.dataIndex]) : new Date(0);
          const bDate = b[column.dataIndex] ? new Date(b[column.dataIndex]) : new Date(0);
          return aDate - bDate;
        };
      }

      if (header.toLowerCase().includes('category') || header.toLowerCase().includes('type')) {
        column.filters = categories.slice(1).map(cat => ({ text: cat.label, value: cat.value }));
        column.onFilter = (value, record) => record[column.dataIndex]?.toLowerCase() === value;
      }

      return column;
    });
  };

  const calculateMetrics = (dataSet) => {
    const totalRequests = dataSet.length;
    const successfulRequests = dataSet.filter(item => item.status === 'success').length;
    const failedRequests = totalRequests - successfulRequests;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
    const avgResponseTime = dataSet.reduce((acc, item) => acc + (item.responseTime || 0), 0) / totalRequests || 0;

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

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Transform dates to consistent format and validate data
        const transformedData = jsonData.map((item, index) => {
          if (!item.date || !item.category || !item.status) {
            throw new Error('Missing required fields in Excel file');
          }

          return {
            key: index,
            date: dayjs(item.date).format('YYYY-MM-DD'),
            category: item.category,
            status: item.status,
            responseTime: parseFloat(item.responseTime) || 0,
          };
        });

        // Create columns from headers
        const headers = Object.keys(jsonData[0]);
        setColumns(createColumnsFromHeaders(headers));
        
        setData(transformedData);
        setFilteredData(transformedData);
        setIsFileUploaded(true);
        setUploadedFileName(file.name);
        message.success('File uploaded successfully');
      } catch (error) {
        message.error(`Error processing file: ${error.message}`);
      }
    };
    reader.onerror = () => {
      message.error('Error reading file');
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleRemoveFile = () => {
    setData([]);
    setFilteredData([]);
    setColumns([]);
    setIsFileUploaded(false);
    setUploadedFileName('');
    setDateRange([null, null]);
    setTempDateRange([null, null]);
    setSelectedCategory('all');
    message.success('File removed successfully');
  };

  const handleApplyFilters = () => {
    if (!tempDateRange || !tempDateRange[0] || !tempDateRange[1]) {
      message.warning('Please select both start and end dates');
      return;
    }

    const [startDate, endDate] = tempDateRange;
    
    // Validate dates
    if (!dayjs(startDate).isValid() || !dayjs(endDate).isValid()) {
      message.error('Invalid date selection');
      return;
    }

    // Validate data array
    if (!Array.isArray(data) || data.length === 0) {
      message.warning('No data available to filter');
      return;
    }

    try {
      let filtered = [...data];
      
      // Apply date filtering with proper date parsing and validation
      filtered = filtered.filter(item => {
        if (!item || !item.date) return false;
        
        const itemDate = dayjs(item.date);
        if (!itemDate.isValid()) return false;

        const start = dayjs(startDate).startOf('day');
        const end = dayjs(endDate).endOf('day');

        return itemDate.unix() >= start.unix() && itemDate.unix() <= end.unix();
      });

      // Apply category filtering if needed
      if (selectedCategory && selectedCategory !== 'all') {
        filtered = filtered.filter(item => {
          if (!item || !item.category) return false;
          return item.category.toLowerCase() === selectedCategory.toLowerCase();
        });
      }

      // Update states
      setDateRange(tempDateRange);
      setFilteredData(filtered);
      setPagination(prev => ({
        ...prev,
        total: filtered.length,
        current: 1,
        pageSize: 10
      }));

      // Calculate previous period metrics
      if (filtered.length > 0) {
        const daysDiff = dayjs(endDate).diff(dayjs(startDate), 'day');
        const previousStartDate = dayjs(startDate).subtract(daysDiff + 1, 'day');
        const previousEndDate = dayjs(startDate).subtract(1, 'day');

        const previousPeriodData = data.filter(item => {
          if (!item || !item.date) return false;
          
          const itemDate = dayjs(item.date);
          if (!itemDate.isValid()) return false;
          
          return itemDate.unix() >= previousStartDate.unix() && 
                 itemDate.unix() <= previousEndDate.unix();
        });

        setPreviousMetrics(calculateMetrics(previousPeriodData));
      }

      // Show appropriate message based on results
      if (filtered.length === 0) {
        message.info(`No records found between ${dayjs(startDate).format('YYYY-MM-DD')} and ${dayjs(endDate).format('YYYY-MM-DD')}`);
      } else {
        message.success(`Found ${filtered.length} records between ${dayjs(startDate).format('YYYY-MM-DD')} and ${dayjs(endDate).format('YYYY-MM-DD')}`);
      }

    } catch (error) {
      console.error('Filtering error:', error);
      message.error('Error applying filters');
    }
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      ...newPagination
    }));
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
    <div className="daily-report-container">
      <Card title="Daily Report" className="daily-report-card">
        <div className="controls-section">
          <div className="upload-section">
            <Upload
              beforeUpload={handleFileUpload}
              accept=".xlsx,.xls"
              showUploadList={false}
            >
              <Button
                icon={isFileUploaded ? <CheckCircleOutlined /> : <UploadOutlined />}
                style={{
                  background: isFileUploaded 
                    ? 'linear-gradient(to right, #52c41a, #ffffff)'
                    : 'linear-gradient(to right, #1890ff, #ffffff)',
                  borderColor: isFileUploaded ? '#52c41a' : '#1890ff',
                  color: '#000000',
                  minWidth: '140px'
                }}
                title={isFileUploaded ? uploadedFileName : 'Upload Excel File'}
              >
                {isFileUploaded ? uploadedFileName : 'Upload Excel File'}
              </Button>
            </Upload>
            {isFileUploaded && (
              <Button 
                icon={<DeleteOutlined />} 
                onClick={handleRemoveFile}
                style={{
                  background: 'linear-gradient(to right, #ffa39e, #ffffff)',
                  borderColor: '#ffa39e',
                  color: '#000000',
                  minWidth: '140px'
                }}
              >
                Remove File
              </Button>
            )}
          </div>
          <div className="filters-section">
            <Select
              className="select-bold"
              style={{ 
                width: '280px',
                background: 'linear-gradient(to right, #f0f0f0, #ffffff)'
              }}
              value={selectedCategory}
              onChange={(value) => {
                setSelectedCategory(value);
                handleApplyFilters();
              }}
              options={categories}
              placeholder="Select Category"
            />
            <RangePicker
              className="date-picker-bold"
              value={tempDateRange}
              onChange={(dates) => {
                setTempDateRange(dates);
              }}
              format="YYYY-MM-DD"
              style={{ 
                width: '340px',
                background: 'linear-gradient(to right, #f0f0f0, #ffffff)'
              }}
            />
            <Button
              type="primary"
              onClick={handleApplyFilters}
              style={{
                background: 'linear-gradient(to right, #1890ff, #096dd9)',
                borderColor: '#1890ff'
              }}
            >
              Apply Filters
            </Button>
          </div>
        </div>

        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card className="metrics-card" bodyStyle={{ position: 'relative', paddingBottom: '32px' }}>
              <Statistic
                title="Total Requests"
                value={currentMetrics.totalRequests}
                precision={0}
              />
              {comparison && renderComparisonValue(comparison.totalRequests)}
            </Card>
          </Col>
          <Col span={6}>
            <Card className="metrics-card" bodyStyle={{ position: 'relative', paddingBottom: '32px' }}>
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
            <Card className="metrics-card" bodyStyle={{ position: 'relative', paddingBottom: '32px' }}>
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
            <Card className="metrics-card" bodyStyle={{ position: 'relative', paddingBottom: '32px' }}>
              <Statistic
                title="Failed Requests"
                value={currentMetrics.failedRequests}
                precision={0}
              />
              {comparison && renderComparisonValue(comparison.failedRequests, true)}
            </Card>
          </Col>
        </Row>

        <div className="table-container">
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            onChange={handleTableChange}
            scroll={{ x: true }}
          />
        </div>
      </Card>
    </div>
  );
};

export default DailyReport; 