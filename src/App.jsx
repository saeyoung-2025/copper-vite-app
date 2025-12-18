import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, DollarSign, Package, Activity, Bell, BellOff, Moon, Sun, Settings, Newspaper, Factory, ChevronDown, ChevronUp, Trash2, RefreshCw } from 'lucide-react';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showIndicatorPerformance, setShowIndicatorPerformance] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAppGuide, setShowAppGuide] = useState(false);
  
  // 임시 설정 (저장 전)
  const [tempSettings, setTempSettings] = useState({
    rsiBuy: 35,
    rsiSell: 65
  });
  const [tempIndicatorSettings, setTempIndicatorSettings] = useState({
    dollarIndex: { enabled: true },
    inventory: { enabled: true },
    pmi: { enabled: true },
    rsi: { enabled: true },
    macd: { enabled: true }
  });
  
  const [currentData, setCurrentData] = useState({
    copperPrice: 4.15,
    dollarIndex: 98.5,
    inventory: 145000,
    pmi: 50.2,
    rsi: 45,
    macd: 0.08,
    signal: 'HOLD'
  });

  // 지표 활성화 설정
  const [indicatorSettings, setIndicatorSettings] = useState({
    dollarIndex: { enabled: true, threshold: 100, condition: 'less' },
    inventory: { enabled: true, threshold: 145000, condition: 'less' },
    pmi: { enabled: true, threshold: 50, condition: 'greater' },
    rsi: { enabled: true, buyThreshold: 35, sellThreshold: 65 },
    macd: { enabled: true, threshold: 0, condition: 'greater' }
  });

  const [customSettings, setCustomSettings] = useState({
    rsiBuy: 35,
    rsiSell: 65
  });

  // 지표별 성과 데이터 (API 연동 시 실제 데이터로 대체)
  const [indicatorPerformance, setIndicatorPerformance] = useState({
    dollarIndex: { hasData: false, winRate: null, profit: null },
    inventory: { hasData: false, winRate: null, profit: null },
    pmi: { hasData: false, winRate: null, profit: null },
    rsi: { hasData: false, winRate: null, profit: null },
    macd: { hasData: false, winRate: null, profit: null }
  });

  const [yearlyData, setYearlyData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const [news] = useState([
    { title: "중국 제조업 PMI 상승, 구리 수요 증가 전망", source: "로이터", time: "1시간 전", sentiment: "positive" },
    { title: "칠레 최대 구리 광산 파업 예고", source: "블룸버그", time: "3시간 전", sentiment: "positive" },
    { title: "연준 금리 인하 신호로 달러 약세", source: "CNBC", time: "5시간 전", sentiment: "positive" },
    { title: "LME 구리 재고량 2% 감소", source: "메탈 불레틴", time: "7시간 전", sentiment: "positive" }
  ]);

  const correlationData = [
    { name: '금', correlation: 0.75, price: 2050 },
    { name: '은', correlation: 0.82, price: 24.5 },
    { name: '알루미늄', correlation: 0.68, price: 2.15 }
  ];

  const indicatorNames = {
    dollarIndex: '달러 인덱스',
    inventory: '재고량',
    pmi: '중국 PMI',
    rsi: 'RSI',
    macd: 'MACD'
  };

  const indicatorConditions = {
    dollarIndex: '< 100',
    inventory: '< 145,000',
    pmi: '> 50',
    rsi: `< ${customSettings.rsiBuy}`,
    macd: '> 0'
  };

  // 점수 계산 함수
  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;
    const results = {};

    if (indicatorSettings.dollarIndex.enabled) {
      maxScore += 20;
      const passed = currentData.dollarIndex < 100;
      if (passed) totalScore += 20;
      results.dollarIndex = passed;
    }

    if (indicatorSettings.inventory.enabled) {
      maxScore += 20;
      const passed = currentData.inventory < 145000;
      if (passed) totalScore += 20;
      results.inventory = passed;
    }

    if (indicatorSettings.pmi.enabled) {
      maxScore += 20;
      const passed = currentData.pmi > 50;
      if (passed) totalScore += 20;
      results.pmi = passed;
    }

    if (indicatorSettings.rsi.enabled) {
      maxScore += 20;
      const passed = currentData.rsi < customSettings.rsiBuy;
      if (passed) totalScore += 20;
      results.rsi = passed;
    }

    if (indicatorSettings.macd.enabled) {
      maxScore += 20;
      const passed = currentData.macd > 0;
      if (passed) totalScore += 20;
      results.macd = passed;
    }

    return {
      score: totalScore,
      maxScore: maxScore,
      percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
      results
    };
  };

  const scoreData = calculateScore();

  // LocalStorage에서 설정 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('copperAppSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.customSettings) {
          setCustomSettings(parsed.customSettings);
        }
        if (parsed.indicatorSettings) {
          setIndicatorSettings(prev => ({
            ...prev,
            ...parsed.indicatorSettings
          }));
        }
      } catch (e) {
        console.log('설정 불러오기 실패');
      }
    }
  }, []);

  // 앱 시작 시 초기 데이터 로드
  useEffect(() => {
    // 초기 차트 데이터 (API 호출 전 임시 데이터)
    const data = [];
    let copper = 4.0;
    let gold = 2000;
    
    for (let i = 180; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      copper += (Math.random() - 0.5) * 0.05;
      gold += (Math.random() - 0.5) * 10;
      
      data.push({
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        copper: parseFloat(copper.toFixed(2)),
        gold: parseFloat(gold.toFixed(0))
      });
    }
    setYearlyData(data);
  }, []);

  const addNotification = (message) => {
    if (!alertEnabled) return;
    setNotifications(prev => [{id: Date.now(), msg: message}, ...prev.slice(0, 4)]);
  };

  // 데이터 새로고침 함수 (실제 API 호출)
  const refreshData = async () => {
    setIsLoading(true);
    
    try {
      // CORS 프록시를 통한 Yahoo Finance API 호출
      const proxyUrl = 'https://corsproxy.io/?';
      
      const [copperRes, dollarRes, goldRes] = await Promise.all([
        // 구리 선물 (HG=F)
        fetch(proxyUrl + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/HG=F?interval=1d&range=1y')),
        // 달러 인덱스 (DX-Y.NYB)
        fetch(proxyUrl + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/DX-Y.NYB?interval=1d&range=1y')),
        // 금 선물 (GC=F)
        fetch(proxyUrl + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1y'))
      ]);
      
      const copperData = await copperRes.json();
      const dollarData = await dollarRes.json();
      const goldData = await goldRes.json();
      
      // 현재 가격 추출
      const copperPrice = copperData?.chart?.result?.[0]?.meta?.regularMarketPrice || currentData.copperPrice;
      const dollarIndex = dollarData?.chart?.result?.[0]?.meta?.regularMarketPrice || currentData.dollarIndex;
      const goldPrice = goldData?.chart?.result?.[0]?.meta?.regularMarketPrice || 2050;
      
      // 구리 과거 데이터로 RSI, MACD 계산
      const copperPrices = copperData?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
      const validPrices = copperPrices.filter(p => p !== null);
      
      // RSI 계산 (14일 기준)
      const rsi = calculateRSI(validPrices, 14);
      
      // MACD 계산
      const macd = calculateMACD(validPrices);
      
      // 차트 데이터 업데이트
      const timestamps = copperData?.chart?.result?.[0]?.timestamp || [];
      const goldPrices = goldData?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
      
      const chartData = timestamps.map((ts, i) => ({
        date: new Date(ts * 1000).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        copper: copperPrices[i] ? parseFloat(copperPrices[i].toFixed(2)) : null,
        gold: goldPrices[i] ? parseFloat(goldPrices[i].toFixed(0)) : null
      })).filter(d => d.copper !== null);
      
      setYearlyData(chartData.slice(-180)); // 최근 180일
      
      // 신호 판단
      let buyConditions = 0;
      let totalConditions = 0;

      if (indicatorSettings.rsi.enabled) {
        totalConditions++;
        if (rsi < customSettings.rsiBuy) buyConditions++;
      }
      if (indicatorSettings.dollarIndex.enabled) {
        totalConditions++;
        if (dollarIndex < 100) buyConditions++;
      }
      if (indicatorSettings.macd.enabled) {
        totalConditions++;
        if (macd > 0) buyConditions++;
      }
      if (indicatorSettings.pmi.enabled) {
        totalConditions++;
        // PMI는 월간 데이터라 API로 실시간 불가 - 기본값 사용
        if (currentData.pmi > 50) buyConditions++;
      }
      if (indicatorSettings.inventory.enabled) {
        totalConditions++;
        // 재고량도 주간 데이터 - 기본값 사용
        if (currentData.inventory < 145000) buyConditions++;
      }

      let signal = 'HOLD';
      const conditionRatio = totalConditions > 0 ? buyConditions / totalConditions : 0;
      
      if (conditionRatio >= 0.6) {
        signal = 'BUY';
      } else if (rsi > customSettings.rsiSell && macd < 0) {
        signal = 'SELL';
      }
      
      setCurrentData({
        copperPrice: parseFloat(copperPrice.toFixed(2)),
        dollarIndex: parseFloat(dollarIndex.toFixed(1)),
        inventory: currentData.inventory, // 실시간 API 없음
        pmi: currentData.pmi, // 실시간 API 없음
        rsi: parseFloat(rsi.toFixed(1)),
        macd: parseFloat(macd.toFixed(2)),
        signal
      });
      
      setLastUpdated(new Date().toLocaleTimeString('ko-KR'));
      setToastMessage('최신 데이터로 업데이트되었습니다');
      
    } catch (error) {
      console.error('API 호출 실패:', error);
      setToastMessage('데이터를 가져오는데 실패했습니다. 다시 시도해주세요.');
    }
    
    setIsLoading(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };
  
  // RSI 계산 함수
  const calculateRSI = (prices, period = 14) => {
    if (prices.length < period + 1) return 50;
    
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }
    
    const recentChanges = changes.slice(-period);
    let gains = 0, losses = 0;
    
    recentChanges.forEach(change => {
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    });
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };
  
  // MACD 계산 함수
  const calculateMACD = (prices) => {
    if (prices.length < 26) return 0;
    
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    
    return ema12 - ema26;
  };
  
  // EMA 계산 함수
  const calculateEMA = (prices, period) => {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    
    const k = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    
    return ema;
  };

  // 임시 지표 토글 (저장 전)
  const toggleTempIndicator = (key) => {
    setTempIndicatorSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled }
    }));
  };

  // 설정 저장
  const saveSettings = () => {
    setCustomSettings({...tempSettings});
    setIndicatorSettings(prev => {
      const newSettings = {...prev};
      Object.keys(tempIndicatorSettings).forEach(key => {
        newSettings[key] = {...newSettings[key], enabled: tempIndicatorSettings[key].enabled};
      });
      // LocalStorage에 저장
      localStorage.setItem('copperAppSettings', JSON.stringify({
        customSettings: tempSettings,
        indicatorSettings: newSettings
      }));
      return newSettings;
    });
    setToastMessage('설정이 저장되었습니다');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 설정 열 때 현재값으로 임시설정 초기화
  useEffect(() => {
    if (showSettings) {
      setTempSettings({...customSettings});
      setTempIndicatorSettings({
        dollarIndex: { enabled: indicatorSettings.dollarIndex.enabled },
        inventory: { enabled: indicatorSettings.inventory.enabled },
        pmi: { enabled: indicatorSettings.pmi.enabled },
        rsi: { enabled: indicatorSettings.rsi.enabled },
        macd: { enabled: indicatorSettings.macd.enabled }
      });
    }
  }, [showSettings]);

  // 지표 삭제 (비활성화)
  const removeIndicator = (key) => {
    setIndicatorSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: false }
    }));
  };

  const styles = {
    app: {
      minHeight: '100vh',
      background: darkMode ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)' : '#f9fafb',
      padding: '20px 16px'
    },
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      width: '100%'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '12px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: darkMode ? 'white' : '#111827',
      marginBottom: '4px'
    },
    subtitle: {
      color: darkMode ? '#94a3b8' : '#6b7280',
      fontSize: '14px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '8px'
    },
    button: {
      padding: '10px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: darkMode ? '#334155' : '#e5e7eb',
      color: darkMode ? 'white' : '#111827'
    },
    signalCard: {
      background: currentData.signal === 'BUY' ? '#22c55e' : currentData.signal === 'SELL' ? '#ef4444' : '#eab308',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '16px',
      color: 'white',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
    },
    signalFlex: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px'
    },
    signalHeader: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '4px'
    },
    signalPrice: {
      fontSize: '40px',
      fontWeight: 'bold'
    },
    card: {
      backgroundColor: darkMode ? '#1e293b' : 'white',
      border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginBottom: '16px'
    },
    metricCard: {
      backgroundColor: darkMode ? '#1e293b' : 'white',
      border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
      borderRadius: '12px',
      padding: '12px',
      cursor: 'pointer',
      textDecoration: 'none',
      color: 'inherit',
      display: 'block',
      transition: 'border-color 0.2s'
    },
    metricValue: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: darkMode ? 'white' : '#111827',
      marginTop: '6px'
    },
    notification: {
      backgroundColor: darkMode ? '#0f172a' : '#f3f4f6',
      padding: '8px',
      borderRadius: '6px',
      marginBottom: '4px',
      fontSize: '13px',
      color: darkMode ? '#94a3b8' : '#6b7280'
    },
    sectionTitle: {
      color: darkMode ? 'white' : '#111827',
      fontWeight: 'bold',
      marginBottom: '12px',
      fontSize: '16px',
      margin: 0
    },
    newsItem: {
      backgroundColor: darkMode ? '#0f172a' : '#f9fafb',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '8px'
    },
    toggle: {
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background-color 0.2s'
    },
    toggleKnob: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      backgroundColor: 'white',
      position: 'absolute',
      top: '2px',
      transition: 'left 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
    },
    performanceItem: {
      backgroundColor: darkMode ? '#0f172a' : '#f3f4f6',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  };

  const getSignalText = (s) => s === 'BUY' ? '매수 신호' : s === 'SELL' ? '매도 신호' : '관망';

  const getRecommendation = () => {
    if (scoreData.percentage >= 80) return '적극 매수 권장';
    if (scoreData.percentage >= 60) return '매수 적합';
    if (scoreData.percentage >= 40) return '분할 매수 고려';
    return '관망 권장';
  };

  return (
    <div style={styles.app}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.container}>
        
        {/* 토스트 메시지 */}
        {showToast && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#22c55e',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ✓ {toastMessage}
          </div>
        )}
        
        {/* 헤더 */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>구리 매수 시점 분석</h1>
            <p style={styles.subtitle}>
              {lastUpdated ? `마지막 업데이트: ${lastUpdated}` : '실시간 데이터 분석'}
            </p>
          </div>
          <div style={styles.buttonGroup}>
            <button onClick={() => setDarkMode(!darkMode)} style={styles.button}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={refreshData} style={{...styles.button, opacity: isLoading ? 0.6 : 1}} disabled={isLoading} title="데이터 새로고침">
              <RefreshCw size={18} style={{animation: isLoading ? 'spin 1s linear infinite' : 'none'}} />
            </button>
            <button onClick={() => setShowSettings(!showSettings)} style={styles.button}>
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* 메인 신호 */}
        <div style={styles.signalCard}>
          <div style={styles.signalFlex}>
            <div>
              <h2 style={styles.signalHeader}>{getSignalText(currentData.signal)}</h2>
              <p style={{opacity: 0.8, margin: 0, fontSize: '13px'}}>종합 분석 결과</p>
            </div>
            <div style={{textAlign: 'right'}}>
              <div style={styles.signalPrice}>${currentData.copperPrice}</div>
              <div style={{opacity: 0.8, fontSize: '13px'}}>현재 구리 가격</div>
            </div>
          </div>
        </div>

        {/* 상세 분석 */}
        <div style={{
          ...styles.card,
          background: darkMode ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          borderColor: darkMode ? '#3b82f6' : '#93c5fd'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <span style={{fontSize: '24px'}}>📊</span>
              <div>
                <div style={{fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#93c5fd' : '#1e40af'}}>
                  점수: {scoreData.score}점 / {scoreData.maxScore}점
                </div>
                <div style={{fontSize: '12px', color: darkMode ? '#bfdbfe' : '#3b82f6'}}>
                  {getRecommendation()}
                </div>
              </div>
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: darkMode ? '#93c5fd' : '#1e40af'
            }}>
              {scoreData.percentage}%
            </div>
          </div>
          
          <div style={{
            fontSize: '13px', 
            color: darkMode ? '#e0e7ff' : '#1e40af',
            lineHeight: '1.6',
            marginBottom: '12px'
          }}>
            {scoreData.percentage >= 60 ? 
              '활성화된 지표들이 매수 조건을 충족하고 있습니다.' :
              '추세는 유지되지만 모멘텀이 둔화되어 현재는 관망이 유리합니다.'}
          </div>
          
          {/* 지표 충족 현황 */}
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
            {Object.entries(indicatorSettings).map(([key, setting]) => {
              if (!setting.enabled) return null;
              const passed = scoreData.results[key];
              return (
                <span key={key} style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: passed 
                    ? (darkMode ? '#166534' : '#bbf7d0')
                    : (darkMode ? '#7c2d12' : '#fed7aa'),
                  color: passed
                    ? (darkMode ? '#bbf7d0' : '#166534')
                    : (darkMode ? '#fed7aa' : '#7c2d12')
                }}>
                  {passed ? '✓' : '✗'} {indicatorNames[key]} {indicatorConditions[key]}
                </span>
              );
            })}
          </div>
        </div>

        {/* 커스텀 설정 */}
        {showSettings && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>커스텀 설정</h3>
            
            {/* RSI 임계값 설정 */}
            <div style={{marginTop: '16px', marginBottom: '20px'}}>
              <div style={{fontSize: '14px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#374151', marginBottom: '12px'}}>
                RSI 임계값
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                <div>
                  <label style={{fontSize: '12px', color: darkMode ? '#94a3b8' : '#6b7280', display: 'block', marginBottom: '4px'}}>
                    RSI 매수
                  </label>
                  <input type="number" value={tempSettings.rsiBuy}
                    onChange={(e) => setTempSettings({...tempSettings, rsiBuy: parseFloat(e.target.value)})}
                    style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155', 
                           backgroundColor: darkMode ? '#0f172a' : '#fff', color: darkMode ? '#fff' : '#000', boxSizing: 'border-box'}} />
                </div>
                <div>
                  <label style={{fontSize: '12px', color: darkMode ? '#94a3b8' : '#6b7280', display: 'block', marginBottom: '4px'}}>
                    RSI 매도
                  </label>
                  <input type="number" value={tempSettings.rsiSell}
                    onChange={(e) => setTempSettings({...tempSettings, rsiSell: parseFloat(e.target.value)})}
                    style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155',
                           backgroundColor: darkMode ? '#0f172a' : '#fff', color: darkMode ? '#fff' : '#000', boxSizing: 'border-box'}} />
                </div>
              </div>
            </div>

            {/* 지표 ON/OFF 토글 */}
            <div style={{borderTop: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`, paddingTop: '16px'}}>
              <div style={{fontSize: '14px', fontWeight: '600', color: darkMode ? '#e2e8f0' : '#374151', marginBottom: '12px'}}>
                지표 활성화
              </div>
              {Object.entries(tempIndicatorSettings).map(([key, setting]) => (
                <div key={key} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`
                }}>
                  <div>
                    <div style={{fontSize: '14px', color: darkMode ? 'white' : '#111827'}}>
                      {indicatorNames[key]}
                    </div>
                    <div style={{fontSize: '11px', color: darkMode ? '#94a3b8' : '#6b7280'}}>
                      조건: {indicatorConditions[key]}
                    </div>
                  </div>
                  <div 
                    onClick={() => toggleTempIndicator(key)}
                    style={{
                      ...styles.toggle,
                      backgroundColor: setting.enabled ? '#22c55e' : (darkMode ? '#475569' : '#d1d5db')
                    }}
                  >
                    <div style={{
                      ...styles.toggleKnob,
                      left: setting.enabled ? '22px' : '2px'
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* 저장 버튼 */}
            <button
              onClick={saveSettings}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              💾 설정 저장
            </button>
          </div>
        )}

        {/* 지표 카드 */}
        <div style={styles.grid}>
          {indicatorSettings.dollarIndex.enabled && (
            <a href="https://www.investing.com/indices/usdollar" target="_blank" rel="noopener noreferrer" style={styles.metricCard}>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px'}}>
                <DollarSign size={14} color="#3b82f6" />
                <span style={{fontSize: '12px', color: darkMode ? '#94a3b8' : '#6b7280'}}>달러 인덱스</span>
              </div>
              <div style={styles.metricValue}>{currentData.dollarIndex}</div>
            </a>
          )}
          
          {indicatorSettings.inventory.enabled && (
            <a href="https://en.macromicro.me/series/3613/copper-lme-warehouse-stock" target="_blank" rel="noopener noreferrer" style={styles.metricCard}>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px'}}>
                <Package size={14} color="#a855f7" />
                <span style={{fontSize: '12px', color: darkMode ? '#94a3b8' : '#6b7280'}}>재고량</span>
              </div>
              <div style={styles.metricValue}>{Math.round(currentData.inventory).toLocaleString()}</div>
            </a>
          )}
          
          {indicatorSettings.pmi.enabled && (
            <a href="https://www.tradingeconomics.com/china/manufacturing-pmi" target="_blank" rel="noopener noreferrer" style={styles.metricCard}>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px'}}>
                <Factory size={14} color="#f59e0b" />
                <span style={{fontSize: '12px', color: darkMode ? '#94a3b8' : '#6b7280'}}>중국 PMI</span>
              </div>
              <div style={styles.metricValue}>{currentData.pmi.toFixed(1)}</div>
            </a>
          )}
          
          {indicatorSettings.rsi.enabled && (
            <a href="https://www.tradingview.com/symbols/COMEX-HG1!/technicals/" target="_blank" rel="noopener noreferrer" style={styles.metricCard}>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px'}}>
                <Activity size={14} color="#22c55e" />
                <span style={{fontSize: '12px', color: darkMode ? '#94a3b8' : '#6b7280'}}>RSI</span>
              </div>
              <div style={styles.metricValue}>{currentData.rsi}</div>
            </a>
          )}
          
          {indicatorSettings.macd.enabled && (
            <a href="https://www.tradingview.com/symbols/COMEX-HG1!/technicals/" target="_blank" rel="noopener noreferrer" style={styles.metricCard}>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px'}}>
                <TrendingUp size={14} color="#eab308" />
                <span style={{fontSize: '12px', color: darkMode ? '#94a3b8' : '#6b7280'}}>MACD</span>
              </div>
              <div style={styles.metricValue}>{currentData.macd}</div>
            </a>
          )}
        </div>

        {/* 지표별 성과 (펼침 메뉴) */}
        <div style={styles.card}>
          <div 
            onClick={() => setShowIndicatorPerformance(!showIndicatorPerformance)}
            style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <h3 style={styles.sectionTitle}>📈 내 지표별 성과</h3>
            {showIndicatorPerformance ? <ChevronUp size={20} color={darkMode ? '#94a3b8' : '#6b7280'} /> : <ChevronDown size={20} color={darkMode ? '#94a3b8' : '#6b7280'} />}
          </div>
          
          {showIndicatorPerformance && (
            <div style={{marginTop: '12px'}}>
              {Object.entries(indicatorSettings).map(([key, setting]) => {
                if (!setting.enabled) return null;
                const perf = indicatorPerformance[key];
                
                return (
                  <div key={key} style={styles.performanceItem}>
                    <div style={{flex: 1}}>
                      <div style={{
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: darkMode ? 'white' : '#111827',
                        marginBottom: '4px'
                      }}>
                        📊 {indicatorNames[key]} {indicatorConditions[key]}
                      </div>
                      {perf.hasData ? (
                        <div style={{fontSize: '12px', color: darkMode ? '#94a3b8' : '#6b7280'}}>
                          승률 {perf.winRate}% | 수익률 {perf.profit > 0 ? '+' : ''}{perf.profit}%
                        </div>
                      ) : (
                        <div style={{fontSize: '12px', color: '#f59e0b'}}>
                          ⚠️ 아직 데이터가 쌓이지 않았어요. 일정 데이터가 쌓이면 결과값이 나타납니다.
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeIndicator(key);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                );
              })}
              
              {Object.values(indicatorSettings).every(s => !s.enabled) && (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: darkMode ? '#94a3b8' : '#6b7280',
                  fontSize: '14px'
                }}>
                  활성화된 지표가 없습니다. 설정에서 지표를 활성화해주세요.
                </div>
              )}
            </div>
          )}
        </div>

        {/* 차트 */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>구리 1년 추이</h3>
          <p style={{fontSize: '11px', color: darkMode ? '#94a3b8' : '#6b7280', margin: '0 0 12px 0'}}>
            ※ 실제 가격 ($/lb)
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e5e7eb'} />
              <XAxis dataKey="date" stroke={darkMode ? '#94a3b8' : '#6b7280'} style={{fontSize: 9}} />
              <YAxis stroke={darkMode ? '#94a3b8' : '#6b7280'} style={{fontSize: 10}} />
              <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', fontSize: 11 }} />
              <Line type="monotone" dataKey="copper" stroke="#60a5fa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>금 1년 추이</h3>
          <p style={{fontSize: '11px', color: darkMode ? '#94a3b8' : '#6b7280', margin: '0 0 12px 0'}}>
            ※ 실제 가격 ($/oz)
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e5e7eb'} />
              <XAxis dataKey="date" stroke={darkMode ? '#94a3b8' : '#6b7280'} style={{fontSize: 9}} />
              <YAxis stroke={darkMode ? '#94a3b8' : '#6b7280'} style={{fontSize: 10}} />
              <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', fontSize: 11 }} />
              <Line type="monotone" dataKey="gold" stroke="#fbbf24" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 뉴스 */}
        <div style={styles.card}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
            <Newspaper size={16} color="#3b82f6" />
            <h3 style={styles.sectionTitle}>실시간 뉴스</h3>
          </div>
          {news.map((item, i) => (
            <a key={i} href="https://kr.investing.com/news/commodities-news" target="_blank" rel="noopener noreferrer" 
               style={{...styles.newsItem, textDecoration: 'none', display: 'block', cursor: 'pointer'}}>
              <div style={{display: 'flex', gap: '8px', alignItems: 'start'}}>
                <div style={{width: '6px', height: '6px', borderRadius: '50%', 
                            backgroundColor: item.sentiment === 'positive' ? '#22c55e' : '#ef4444', 
                            marginTop: '6px', flexShrink: 0}} />
                <div style={{flex: 1}}>
                  <div style={{color: darkMode ? 'white' : '#111827', fontSize: '13px', fontWeight: '500', marginBottom: '4px'}}>
                    {item.title}
                  </div>
                  <div style={{color: darkMode ? '#94a3b8' : '#6b7280', fontSize: '11px'}}>
                    {item.source} • {item.time}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* 상관관계 */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>원자재 상관관계</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e5e7eb'} />
              <XAxis dataKey="name" stroke={darkMode ? '#94a3b8' : '#6b7280'} style={{fontSize: 10}} />
              <YAxis stroke={darkMode ? '#94a3b8' : '#6b7280'} domain={[0, 1]} style={{fontSize: 10}} />
              <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', fontSize: 11 }} />
              <Bar dataKey="correlation" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px'}}>
            {correlationData.map((item, i) => (
              <div key={i} style={{...styles.metricCard, cursor: 'default', padding: '8px'}}>
                <div style={{fontSize: '11px', color: darkMode ? '#94a3b8' : '#6b7280', marginBottom: '4px'}}>
                  {item.name}
                </div>
                <div style={{fontSize: '16px', fontWeight: 'bold', color: darkMode ? 'white' : '#111827'}}>
                  ${item.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 푸터 영역 */}
        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`
        }}>
          {/* 앱 소개 버튼 */}
          <button
            onClick={() => setShowAppGuide(!showAppGuide)}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
              backgroundColor: darkMode ? '#1e293b' : 'white',
              color: darkMode ? 'white' : '#111827',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}
          >
            💡 앱 소개
            {showAppGuide ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {/* 앱 소개 펼침 내용 */}
          {showAppGuide && (
            <div style={{
              ...styles.card,
              backgroundColor: darkMode ? '#0f172a' : '#f9fafb',
              marginBottom: '16px'
            }}>
              {/* 시작하기 */}
              <div style={{
                backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: `1px solid ${darkMode ? '#3b82f6' : '#93c5fd'}`
              }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: darkMode ? '#93c5fd' : '#1e40af',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  📌 시작하기
                </div>
                <div style={{
                  fontSize: '13px',
                  color: darkMode ? '#bfdbfe' : '#1e40af',
                  lineHeight: '1.7'
                }}>
                  앱을 시작한 후 우측 상단 <strong>🔄 버튼</strong>을 눌러
                  최신 시장 데이터를 받은 후 이용해주세요.
                  <br/><br/>
                  <span style={{fontSize: '11px', opacity: 0.8}}>
                    * 구리/금 가격, 달러 인덱스, RSI, MACD는 실시간 데이터입니다.
                    <br/>* 중국 PMI, 재고량은 월간/주간 발표 데이터입니다.
                  </span>
                </div>
              </div>

              {/* 점수 기준 */}
              <div style={{marginBottom: '20px'}}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: darkMode ? '#60a5fa' : '#2563eb',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  📊 점수 기준
                </div>
                <div style={{
                  fontSize: '13px',
                  color: darkMode ? '#e2e8f0' : '#374151',
                  lineHeight: '1.8'
                }}>
                  <div style={{marginBottom: '6px'}}>• <strong style={{color: '#22c55e'}}>80점 이상</strong>: 적극 매수 권장</div>
                  <div style={{marginBottom: '6px'}}>• <strong style={{color: '#22c55e'}}>60~79점</strong>: 매수 적합</div>
                  <div style={{marginBottom: '6px'}}>• <strong style={{color: '#eab308'}}>40~59점</strong>: 분할 매수 고려</div>
                  <div>• <strong style={{color: '#ef4444'}}>40점 미만</strong>: 관망 권장</div>
                </div>
              </div>

              {/* 설정 방법 */}
              <div style={{marginBottom: '20px'}}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: darkMode ? '#60a5fa' : '#2563eb',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  ⚙️ 설정 방법
                </div>
                <div style={{
                  fontSize: '13px',
                  color: darkMode ? '#e2e8f0' : '#374151',
                  lineHeight: '1.8'
                }}>
                  <div style={{marginBottom: '6px'}}>• 우측 상단 ⚙️ 버튼으로 설정 열기</div>
                  <div style={{marginBottom: '6px'}}>• RSI 매수/매도 임계값 조절 가능</div>
                  <div style={{marginBottom: '6px'}}>• 지표별 ON/OFF로 원하는 지표만 반영</div>
                  <div>• 변경 후 <strong>[설정 저장]</strong> 필수!</div>
                </div>
              </div>

              {/* 주의사항 */}
              <div style={{
                backgroundColor: darkMode ? '#7c2d12' : '#fef3c7',
                padding: '14px',
                borderRadius: '8px',
                border: `1px solid ${darkMode ? '#9a3412' : '#fcd34d'}`
              }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: darkMode ? '#fed7aa' : '#92400e',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  ⚠️ 주의사항
                </div>
                <div style={{
                  fontSize: '12px',
                  color: darkMode ? '#fed7aa' : '#92400e',
                  lineHeight: '1.7'
                }}>
                  본 앱은 <strong>투자 참고용</strong>이며, 실제 투자 판단은 본인 책임입니다.
                  과거 데이터 기반 분석은 미래 수익을 보장하지 않습니다.
                </div>
              </div>
            </div>
          )}

          {/* 회사 정보 */}
          <div style={{
            textAlign: 'center',
            padding: '16px 0',
            color: darkMode ? '#64748b' : '#9ca3af',
            fontSize: '13px'
          }}>
            <div style={{
              fontWeight: '600',
              marginBottom: '6px',
              color: darkMode ? '#94a3b8' : '#6b7280'
            }}>
              Today_tab
            </div>
            <div>
              <a 
                href="mailto:contact@todaytab.com" 
                style={{
                  color: darkMode ? '#64748b' : '#9ca3af',
                  textDecoration: 'none'
                }}
              >
                contact@todaytab.com
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
