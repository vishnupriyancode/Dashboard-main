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
    { value: 'all', label: 'All Categories' }
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
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
        const newColumns = createColumnsFromHeaders(headers);
        setColumns(newColumns);
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Transform dates to consistent format and handle all data types
        const transformedData = jsonData.map((item, index) => {
          const transformedItem = { key: index };
          headers.forEach(header => {
            const dataIndex = header.toLowerCase().replace(/\s+/g, '_');
            if (header.toLowerCase().includes('date')) {
              // Handle date conversion
              transformedItem[dataIndex] = dayjs(item[header]).format('YYYY-MM-DD');
            } else if (header.toLowerCase().includes('response') && header.toLowerCase().includes('time')) {
              // Handle response time conversion
              const rawValue = item[header];
              let numericValue = 0;
              if (typeof rawValue === 'string') {
                numericValue = parseFloat(rawValue.replace(/[^\d.]/g, '')) || 0;
              } else if (typeof rawValue === 'number') {
                numericValue = rawValue;
              }
              transformedItem[dataIndex] = numericValue;
            } else {
              transformedItem[dataIndex] = item[header];
            }
          });
          return transformedItem;
        });
        
        setData(transformedData);
        setFilteredData(transformedData);
        setIsFileUploaded(true);
        message.success('File uploaded successfully');
      } catch (error) {
        console.error('Error processing file:', error);
        message.error('Error processing file. Please check the file format and try again.');
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleRemoveFile = () => {
    setData([]);
    setFilteredData([]);
    setIsFileUploaded(false);
    setUploadedFileName('');
    setCategories([{ value: 'all', label: 'All Categories' }]);
    setSelectedCategory('all');
    setDateRange([null, null]);
    setTempDateRange([null, null]);
    setPreviousMetrics(null);
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
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
        // Skip items without date
        if (!item || !item.date) {
          return false;
        }
        
        // Ensure proper date parsing
        let itemDate;
        try {
          itemDate = dayjs(item.date);
          if (!itemDate.isValid()) {
            return false;
          }
        } catch (err) {
          console.warn('Invalid date format:', item.date);
          return false;
        }

        const start = dayjs(startDate).startOf('day');
        const end = dayjs(endDate).endOf('day');

        // Ensure all dates are valid before comparison
        if (!start.isValid() || !end.isValid()) {
          return false;
        }

        // Compare dates using unix timestamps for more reliable comparison
        const itemTimestamp = itemDate.startOf('day').unix();
        const startTimestamp = start.unix();
        const endTimestamp = end.unix();

        return itemTimestamp >= startTimestamp && itemTimestamp <= endTimestamp;
      });

      // Apply category filtering if needed
      if (selectedCategory && selectedCategory !== 'all') {
        filtered = filtered.filter(item => {
          if (!item || !item.category) return false;
          return item.category.toLowerCase() === selectedCategory.toLowerCase();
        });
      }

      // Validate filtered results
      if (!Array.isArray(filtered)) {
        throw new Error('Filtering operation returned invalid results');
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

      // Calculate previous period metrics only if we have valid filtered data
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
      console.error('Filtering error details:', {
        error: error.message,
        dataLength: data?.length,
        dateRange: tempDateRange,
        category: selectedCategory
      });
      
      message.error('Error occurred while filtering data. Please check the date format and try again.');
      
      // Reset to initial state on error
      setFilteredData(data);
      setPagination(prev => ({
        ...prev,
        total: data.length,
        current: 1
      }));
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      setFilteredData(data);
      setPagination(prev => ({ ...prev, total: data.length, current: 1 }));
    }
  }, [data]);

  const calculateMetrics = (data) => {
    if (!data || data.length === 0) {
      return {
        totalRequests: 0,
        successRate: 0,
        avgResponseTime: 0,
        failedRequests: 0
      };
    }

    const totalRequests = data.length;
    
    // Find response time column in the first data item
    const responseTimeKey = Object.keys(data[0]).find(key => 
      key.includes('response_time') || key.includes('responsetime')
    );
    
    // Calculate average response time
    const totalResponseTime = data.reduce((sum, item) => {
      const responseTime = parseFloat(item[responseTimeKey]) || 0;
      return sum + responseTime;
    }, 0);
    
    const avgResponseTime = totalResponseTime / totalRequests;

    // Calculate success rate
    const successfulRequests = data.filter(item => {
      const status = (item.status || '').toLowerCase();
      return status === 'success' || status === '200' || status === 'ok';
    }).length;
    
    const failedRequests = totalRequests - successfulRequests;
    const successRate = (successfulRequests / totalRequests) * 100;

    return {
      totalRequests,
      successRate,
      avgResponseTime,
      failedRequests
    };
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
  };

  const renderTable = () => {
    if (!isFileUploaded) {
      return null;
    }

    return (
      <div className="table-container" style={{ marginTop: '20px' }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          onChange={handleTableChange}
          scroll={{ x: true }}
          size="middle"
          bordered
          locale={{
            emptyText: 'No data found for the selected date range'
          }}
        />
      </div>
    );
  };

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
      <Card className="daily-report-card">
        <div className="controls-section">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%', 
            justifyContent: 'space-between' 
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Upload
                beforeUpload={handleFileUpload}
                accept=".xlsx,.xls"
                showUploadList={false}
                maxCount={1}
              >
                <Button 
                  icon={isFileUploaded ? <CheckCircleOutlined style={{ color: '#000000' }} /> : <UploadOutlined />}
                  disabled={isFileUploaded}
                  style={{
                    background: isFileUploaded ? 'linear-gradient(to right, #52c41a, #ffffff)' : 'linear-gradient(to right, #52c41a, #ffffff)',
                    color: '#000000',
                    borderColor: '#52c41a',
                    minWidth: '160px',
                    maxWidth: '300px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                placeholder={['Start Date', 'End Date']}
              />
              <Button 
                type="primary"
                onClick={handleApplyFilters}
                style={{
                  background: 'linear-gradient(to right, #f0f0f0, #ffffff)',
                  borderColor: '#d9d9d9',
                  color: '#000000',
                  minWidth: '120px',
                  fontWeight: '500',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
                disabled={!tempDateRange || !tempDateRange[0] || !tempDateRange[1]}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col span={6}>
            <Card className="metrics-card" style={{ background: 'linear-gradient(to right, #f0f0f0, #ffffff)' }}>
              <Statistic
                title="Total Records"
                value={isFileUploaded ? filteredData.length : 0}
                valueStyle={{ color: '#000000' }}
              />
              {previousMetrics && renderComparisonValue(calculateComparison(calculateMetrics(filteredData), previousMetrics).totalRequests)}
            </Card>
          </Col>
          <Col span={6}>
            <Card className="metrics-card" style={{ background: 'linear-gradient(to right, #f0f0f0, #ffffff)' }}>
              <Statistic
                title="Success Rate"
                value={isFileUploaded ? calculateMetrics(filteredData).successRate.toFixed(2) : "0.00"}
                suffix="%"
                valueStyle={{ color: '#000000' }}
              />
              {previousMetrics && renderComparisonValue(calculateComparison(calculateMetrics(filteredData), previousMetrics).successRate)}
            </Card>
          </Col>
          <Col span={6}>
            <Card className="metrics-card" style={{ background: 'linear-gradient(to right, #f0f0f0, #ffffff)' }}>
              <Statistic
                title="Avg Response Time"
                value={isFileUploaded ? calculateMetrics(filteredData).avgResponseTime.toFixed(2) : "0.00"}
                suffix="ms"
                valueStyle={{ color: '#000000' }}
              />
              {previousMetrics && renderComparisonValue(calculateComparison(calculateMetrics(filteredData), previousMetrics).avgResponseTime, true)}
            </Card>
          </Col>
          <Col span={6}>
            <Card className="metrics-card" style={{ background: 'linear-gradient(to right, #f0f0f0, #ffffff)' }}>
              <Statistic
                title="Failed Requests"
                value={isFileUploaded ? calculateMetrics(filteredData).failedRequests : 0}
                valueStyle={{ color: '#000000' }}
              />
              {previousMetrics && renderComparisonValue(calculateComparison(calculateMetrics(filteredData), previousMetrics).failedRequests, true)}
            </Card>
          </Col>
        </Row>

        {renderTable()}
      </Card>
    </div>
  );
};

export default DailyReport; 