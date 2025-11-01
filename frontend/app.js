class SchedulerSimulator {
  constructor() {
    this.processCounter = 1;
    this.hasRunSimulation = false; // Track if simulation has been run
    this.initializeEventListeners();
    this.loadSampleData();
  }

  initializeEventListeners() {
    // Quantum controls - WITH CHANGE DETECTION
    document.getElementById('quantum-decrease').addEventListener('click', () => {
      this.adjustQuantum(-1);
      this.markParametersChanged();
    });
    document.getElementById('quantum-increase').addEventListener('click', () => {
      this.adjustQuantum(1);
      this.markParametersChanged();
    });

    // Timeline controls - WITH CHANGE DETECTION
    document.getElementById('timeline-decrease').addEventListener('click', () => {
      this.adjustTimeline(-5);
      this.markParametersChanged();
    });
    document.getElementById('timeline-increase').addEventListener('click', () => {
      this.adjustTimeline(5);
      this.markParametersChanged();
    });

    // Process management - WITH CHANGE DETECTION
    document.getElementById('add-process').addEventListener('click', () => {
      this.addProcess();
      this.markParametersChanged();
    });
    document.getElementById('clear-processes').addEventListener('click', () => {
      this.clearProcesses();
      this.markParametersChanged();
    });

    // Run simulation
    document.getElementById('run-simulation').addEventListener('click', () => this.runSimulation());

    // Algorithm selection - WITH CHANGE DETECTION
    document.querySelectorAll('input[name="algorithms"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.updateQuantumVisibility();
        this.markParametersChanged();
      });
    });

    // Output type change detection
    document.querySelectorAll('input[name="output-type"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.markParametersChanged();
      });
    });

    // Time quantum input change detection
    document.getElementById('time-quantum').addEventListener('input', () => {
      this.markParametersChanged();
    });

    // Timeline length input change detection
    document.getElementById('timeline-length').addEventListener('input', () => {
      this.markParametersChanged();
    });

    this.updateQuantumVisibility();
  }

  // NEW METHOD: Mark parameters as changed
  markParametersChanged() {
    if (this.hasRunSimulation) {
      const runButton = document.getElementById('run-simulation');
      runButton.innerHTML = '<i class="fas fa-sync-alt"></i> Update Results';
      runButton.className = 'btn btn-rerun'; // New CSS class for orange color
    }
  }

  // NEW METHOD: Reset button after simulation
  resetRunButton() {
    const runButton = document.getElementById('run-simulation');
    runButton.innerHTML = '<i class="fas fa-play"></i> Run Simulation';
    runButton.className = 'btn btn-run'; // Back to original blue color
    this.hasRunSimulation = true;
  }

  adjustQuantum(delta) {
    const quantumInput = document.getElementById('time-quantum');
    let newValue = parseInt(quantumInput.value) + delta;
    if (newValue >= 1 && newValue <= 20) {
      quantumInput.value = newValue;
    }
  }

  adjustTimeline(delta) {
    const timelineInput = document.getElementById('timeline-length');
    let newValue = parseInt(timelineInput.value) + delta;
    if (newValue >= 10 && newValue <= 100) {
      timelineInput.value = newValue;
    }
  }

  updateQuantumVisibility() {
    const rrCheckbox = document.querySelector('input[name="algorithms"][value="2"]');
    const agingCheckbox = document.querySelector('input[name="algorithms"][value="8"]');
    const quantumCard = document.querySelector('.config-card');
    
    if (rrCheckbox.checked || agingCheckbox.checked) {
      quantumCard.style.opacity = '1';
    } else {
      quantumCard.style.opacity = '0.5';
    }
  }

  addProcess(name = '', arrivalTime = '', burstTime = '') {
    const tbody = document.getElementById('process-tbody');
    const processName = name || `P${this.processCounter}`;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" class="process-input" value="${processName}" placeholder="Process Name"></td>
      <td><input type="number" class="process-input" value="${arrivalTime}" placeholder="0" min="0"></td>
      <td><input type="number" class="process-input" value="${burstTime}" placeholder="1" min="1"></td>
      <td><button type="button" class="btn-remove" onclick="this.closest('tr').remove(); schedulerApp.markParametersChanged();"><i class="fas fa-trash"></i></button></td>
    `;
    
    // ADD CHANGE DETECTION TO NEW INPUTS
    row.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => this.markParametersChanged());
    });
    
    tbody.appendChild(row);
    this.processCounter++;
  }

  clearProcesses() {
    if (confirm('Clear all processes?')) {
      document.getElementById('process-tbody').innerHTML = '';
      this.processCounter = 1;
    }
  }

  loadSampleData() {
    this.clearProcesses();
    const samples = [
      { name: 'A', arrival: 0, burst: 3 },
      { name: 'B', arrival: 2, burst: 6 },
      { name: 'C', arrival: 4, burst: 4 },
      { name: 'D', arrival: 6, burst: 5 },
      { name: 'E', arrival: 8, burst: 2 }
    ];
    
    samples.forEach(process => {
      this.addProcess(process.name, process.arrival, process.burst);
    });
  }

  collectFormData() {
    const outputType = document.querySelector('input[name="output-type"]:checked').value;
    
    const selectedAlgorithms = [];
    document.querySelectorAll('input[name="algorithms"]:checked').forEach(checkbox => {
      const algorithmId = checkbox.value;
      if (algorithmId === '2' || algorithmId === '8') {
        const quantum = document.getElementById('time-quantum').value;
        selectedAlgorithms.push(`${algorithmId}-${quantum}`);
      } else {
        selectedAlgorithms.push(algorithmId);
      }
    });
    
    if (selectedAlgorithms.length === 0) {
      throw new Error('Please select at least one algorithm');
    }
    
    const timelineLength = parseInt(document.getElementById('timeline-length').value);
    
    const processes = [];
    document.querySelectorAll('#process-tbody tr').forEach(row => {
      const inputs = row.querySelectorAll('input');
      const name = inputs[0].value.trim();
      const arrival = parseInt(inputs[1].value) || 0;
      const burst = parseInt(inputs[2].value) || 1;
      
      if (name) {
        processes.push(`${name},${arrival},${burst}`);
      }
    });
    
    if (processes.length === 0) {
      throw new Error('Please add at least one process');
    }
    
    return {
      operation: outputType,
      algorithms: selectedAlgorithms.join(','),
      last_instant: timelineLength,
      process_count: processes.length,
      processes: processes
    };
  }

  parseOutputToStructured(output) {
    const lines = output.split('\n');
    const algorithms = [];
    let currentAlgorithm = null;
    let processes = [];
    let timelineData = [];
    let isTimeline = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect algorithm name
      if (line.match(/^(FCFS|RR-\d+|SPN|SRT|HRRN|FB-1|FB-2i|Aging)/)) {
        if (currentAlgorithm) {
          algorithms.push({
            name: currentAlgorithm,
            processes: [...processes],
            timeline: [...timelineData],
            isTimeline: isTimeline
          });
        }
        
        currentAlgorithm = line;
        processes = [];
        timelineData = [];
        isTimeline = false;
        continue;
      }
      
      // Parse timeline data (for Timeline Trace mode)
      if (line.includes('|') && (line.includes('*') || line.includes('.')) && currentAlgorithm) {
        isTimeline = true;
        const parts = line.split('|');
        if (parts.length > 1) {
          const processName = parts[0].trim();
          const timeline = parts.slice(1, -1).join('');
          timelineData.push({ process: processName, timeline: timeline });
        }
      }
      
      // Parse statistics data (for Statistics mode)
      if (line.startsWith('Process') && line.includes('|')) {
        const processNames = line.split('|').filter(p => p.trim() && p.trim() !== 'Process').map(p => p.trim());
        processes = processNames.map(name => ({ 
          name, arrival: 0, service: 0, finish: 0, turnaround: 0, normTurn: 0 
        }));
        continue;
      }
      
      if (line.startsWith('Arrival') && line.includes('|')) {
        const arrivals = line.split('|').filter(p => p.trim() && p.trim() !== 'Arrival').map(p => parseInt(p.trim()) || 0);
        arrivals.forEach((arrival, index) => {
          if (processes[index]) processes[index].arrival = arrival;
        });
        continue;
      }
      
      if (line.startsWith('Service') && line.includes('|')) {
        const services = line.split('|').filter(p => p.trim() && p.trim() !== 'Service' && p.trim() !== 'Mean').map(p => parseInt(p.trim()) || 0);
        services.forEach((service, index) => {
          if (processes[index]) processes[index].service = service;
        });
        continue;
      }
      
      if (line.startsWith('Finish') && line.includes('|')) {
        const finishes = line.split('|').filter(p => p.trim() && p.trim() !== 'Finish' && !p.includes('-')).map(p => parseInt(p.trim()) || 0);
        finishes.forEach((finish, index) => {
          if (processes[index]) processes[index].finish = finish;
        });
        continue;
      }
      
      if (line.startsWith('Turnaround') && line.includes('|')) {
        const turnarounds = line.split('|').filter(p => p.trim() && p.trim() !== 'Turnaround' && !isNaN(parseFloat(p.trim())));
        turnarounds.forEach((turnaround, index) => {
          if (processes[index]) processes[index].turnaround = parseFloat(turnaround.trim()) || 0;
        });
        continue;
      }
      
      if (line.startsWith('NormTurn') && line.includes('|')) {
        const normTurns = line.split('|').filter(p => p.trim() && p.trim() !== 'NormTurn' && !isNaN(parseFloat(p.trim())));
        normTurns.forEach((normTurn, index) => {
          if (processes[index]) processes[index].normTurn = parseFloat(normTurn.trim()) || 0;
        });
        continue;
      }
      
      // SKIP PARSING LINES THAT START WITH "Turnaround" or "NormTurn" as process names
      if (line.startsWith('Turnaround |') || line.startsWith('NormTurn |')) {
        continue; // Skip these lines - they're summary rows, not processes
      }
    }
    
    // PROCESS TIMELINE DATA TO CALCULATE STATISTICS FOR TIMELINE TRACE MODE
    if (currentAlgorithm) {
      // If we have timeline data but no processes (Timeline Trace mode), calculate from timeline
      if (timelineData.length > 0 && processes.length === 0) {
        const processStats = {};
        
        timelineData.forEach(row => {
          const processName = row.process;
          if (!processStats[processName]) {
            processStats[processName] = {
              name: processName,
              runningTimes: [],
              totalService: 0,
              arrival: -1,
              finish: -1
            };
          }
          
          // Analyze timeline
          for (let i = 0; i < row.timeline.length; i++) {
            if (row.timeline[i] === '*') {
              processStats[processName].runningTimes.push(i);
              processStats[processName].totalService++;
              
              if (processStats[processName].arrival === -1) {
                processStats[processName].arrival = i;
              }
              processStats[processName].finish = i + 1;
            }
          }
        });
        
        // Convert to processes array
        processes = Object.values(processStats).map(stat => {
          const turnaround = stat.finish - stat.arrival;
          const normTurn = stat.totalService > 0 ? turnaround / stat.totalService : 0;
          
          return {
            name: stat.name,
            arrival: Math.max(0, stat.arrival),
            service: stat.totalService,
            finish: stat.finish,
            turnaround: turnaround,
            normTurn: normTurn
          };
        });
      }
      
      algorithms.push({
        name: currentAlgorithm,
        processes: [...processes],
        timeline: [...timelineData],
        isTimeline: isTimeline
      });
    }
    
    return algorithms;
  }

  createTimelineVisualization(timelineData, maxTime) {
    if (!timelineData || timelineData.length === 0) return '';
    
    const actualLength = Math.max(...timelineData.map(row => row.timeline.length), maxTime || 20);
    const colors = ['#e53e3e', '#38a169', '#3182ce', '#d69e2e', '#805ad5', '#dd6b20', '#319795', '#c53030'];
    
    let html = `
      <h4 class="section-title">Timeline Visualization</h4>
      <table class="timeline-table">
        <thead><tr><th style="width: 40px;"></th>
    `;
    
    for (let i = 0; i < actualLength; i++) {
      html += `<th style="width: 20px;">${i}</th>`;
    }
    html += `</tr></thead><tbody>`;
    
    timelineData.forEach((row, rowIndex) => {
      const processColor = colors[rowIndex % colors.length];
      html += `<tr><td style="font-weight: bold; color: ${processColor};">${row.process}</td>`;
      
      for (let i = 0; i < actualLength; i++) {
        const char = i < row.timeline.length ? row.timeline[i] : ' ';
        let content = '';
        let style = 'background: #f7fafc;';
        
        if (char === '*') {
          style = `background: ${processColor}; color: white; font-weight: bold;`;
          content = row.process;
        } else if (char === '.') {
          style = 'background: #fed7d7; color: #c53030;';
          content = '⋯';
        }
        
        html += `<td style="${style}">${content}</td>`;
      }
      html += `</tr>`;
    });
    
    html += `</tbody></table>`;
    return html;
  }

  // UPDATED: Remove Timeline Visualization from Statistics mode
  createAlgorithmTable(algorithmData) {
    const colors = {
      'FCFS': '#e53e3e', 'RR-': '#38a169', 'SPN': '#3182ce', 'SRT': '#d69e2e',
      'HRRN': '#805ad5', 'FB-1': '#dd6b20', 'FB-2i': '#319795', 'Aging': '#c53030'
    };
    
    let color = '#667eea';
    let algorithmName = algorithmData.name;
    
    // Clean algorithm name
    Object.keys(colors).forEach(key => {
      if (algorithmData.name.includes(key)) {
        color = colors[key];
        if (key === 'RR-') {
          algorithmName = algorithmData.name.split(' ')[0];
        } else {
          algorithmName = key === 'FB-1' ? 'FB-1' : 
                       key === 'FB-2i' ? 'FB-2i' : 
                       key === 'Aging' ? 'Aging' : key;
        }
      }
    });
    
    let html = `
      <div class="algorithm-result" style="--algorithm-color: ${color};">
        <h3 class="algorithm-title" style="color: ${color};">
          <i class="fas fa-microchip"></i> ${algorithmName}
        </h3>
    `;
    
    // CHECK OUTPUT TYPE - Only show timeline for Timeline Trace mode
    const outputType = document.querySelector('input[name="output-type"]:checked').value;
    
    // Add timeline ONLY for trace output mode
    if (outputType === 'trace' && algorithmData.isTimeline && algorithmData.timeline.length > 0) {
      html += this.createTimelineVisualization(algorithmData.timeline, 30);
    }
    
    // Always show statistics table
    if (algorithmData.processes.length > 0) {
      html += `
        <h4 class="section-title">Process Statistics</h4>
        <table class="stats-table" style="--algorithm-color: ${color};">
          <thead>
            <tr>
              <th>Process</th><th>Arrival</th><th>Service</th>
              <th>Finish</th><th>Turnaround</th><th>Norm Turn</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      algorithmData.processes.forEach(process => {
        html += `
          <tr>
            <td style="font-weight: bold; color: ${color};">${process.name}</td>
            <td>${process.arrival || 0}</td>
            <td>${process.service || 0}</td>
            <td>${process.finish || 0}</td>
            <td>${process.turnaround || 0}</td>
            <td>${(process.normTurn || 0).toFixed(2)}</td>
          </tr>
        `;
      });
      
      const validProcesses = algorithmData.processes.filter(p => p.turnaround > 0 || p.service > 0);
      if (validProcesses.length > 0) {
        const avgTurnaround = validProcesses.reduce((sum, p) => sum + p.turnaround, 0) / validProcesses.length;
        const avgNormTurn = validProcesses.reduce((sum, p) => sum + p.normTurn, 0) / validProcesses.length;
        
        html += `
          <tr style="background: #f1f5f9; font-weight: bold;">
            <td>Average</td><td>-</td><td>-</td><td>-</td>
            <td style="color: ${color};">${avgTurnaround.toFixed(2)}</td>
            <td style="color: ${color};">${avgNormTurn.toFixed(2)}</td>
          </tr>
        `;
      }
      
      html += `</tbody></table>`;
    }
    
    html += `</div>`;
    return html;
  }

  createComparisonTable(parsedResults) {
    if (parsedResults.length === 0) return '';
    
    const metrics = parsedResults.map(result => {
      // CLEAN ALGORITHM NAMES - REMOVE TIMESTAMPS
      let cleanAlgorithmName = result.algorithm;
      if (result.algorithm.includes('FCFS')) cleanAlgorithmName = 'FCFS';
      else if (result.algorithm.includes('RR-')) cleanAlgorithmName = result.algorithm.split(' ')[0]; // Keep "RR-4"
      else if (result.algorithm.includes('SPN')) cleanAlgorithmName = 'SPN';
      else if (result.algorithm.includes('SRT')) cleanAlgorithmName = 'SRT';
      else if (result.algorithm.includes('HRRN')) cleanAlgorithmName = 'HRRN';
      else if (result.algorithm.includes('FB-1')) cleanAlgorithmName = 'FB-1';
      else if (result.algorithm.includes('FB-2i')) cleanAlgorithmName = 'FB-2i';
      else if (result.algorithm.includes('Aging')) cleanAlgorithmName = 'Aging';
      
      return {
        algorithm: cleanAlgorithmName,
        avgTurnaround: result.avgTurnaround || 0,
        totalTurnaround: result.totalTurnaround || 0,
        processCount: result.processCount || 0,
        efficiency: result.avgTurnaround && result.avgTurnaround > 0 ? (100 / result.avgTurnaround).toFixed(2) : 'N/A'
      };
    });
    
    // FIND BEST VALUES ONLY FROM VALID DATA
    const validAvgTurnarounds = metrics.map(m => m.avgTurnaround).filter(v => v > 0);
    const validTotalTurnarounds = metrics.map(m => m.totalTurnaround).filter(v => v > 0);
    
    const bestAvg = validAvgTurnarounds.length > 0 ? Math.min(...validAvgTurnarounds) : null;
    const bestTotal = validTotalTurnarounds.length > 0 ? Math.min(...validTotalTurnarounds) : null;
    
    let html = `
      <div style="margin-top: 20px;">
        <h3><i class="fas fa-chart-bar"></i> Algorithm Performance Comparison</h3>
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Algorithm</th><th>Avg Turnaround</th><th>Total Completion</th>
              <th>Efficiency</th><th>Processes</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    metrics.forEach(metric => {
      const isAvgBest = metric.avgTurnaround === bestAvg && metric.avgTurnaround > 0;
      const isTotalBest = metric.totalTurnaround === bestTotal && metric.totalTurnaround > 0;
      
      html += `
        <tr>
          <td style="font-weight: bold;">${metric.algorithm}</td>
          <td class="${isAvgBest ? 'best-value' : ''}">${metric.avgTurnaround > 0 ? metric.avgTurnaround.toFixed(2) : 'N/A'}</td>
          <td class="${isTotalBest ? 'best-value' : ''}">${metric.totalTurnaround > 0 ? metric.totalTurnaround.toFixed(2) : 'N/A'}</td>
          <td>${metric.efficiency}${metric.efficiency !== 'N/A' ? '%' : ''}</td>
          <td>${metric.processCount}</td>
        </tr>
      `;
    });
    
    html += `</tbody></table></div>`;
    return html;
  }

  parseResults(output) {
    const algorithmData = this.parseOutputToStructured(output);
    return algorithmData.map(algo => ({
      algorithm: algo.name,
      avgTurnaround: algo.processes.length > 0 ? 
        algo.processes.reduce((sum, p) => sum + p.turnaround, 0) / algo.processes.length : 0,
      totalTurnaround: algo.processes.reduce((sum, p) => sum + p.turnaround, 0),
      processCount: algo.processes.length
    }));
  }

  showResults(output) {
    const resultsContainer = document.getElementById('results-container');
    const resultsContent = document.getElementById('results-content');
    
    const structuredData = this.parseOutputToStructured(output);
    
    let algorithmsHTML = '';
    structuredData.forEach(algorithmData => {
      algorithmsHTML += this.createAlgorithmTable(algorithmData);
    });
    
    const parsedResults = this.parseResults(output);
    const comparisonTable = this.createComparisonTable(parsedResults);
    
    resultsContent.innerHTML = algorithmsHTML + comparisonTable;
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
  }

  showError(message) {
    alert(`Error: ${message}`);
  }

  showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
  }

  hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
  }

  async runSimulation() {
    try {
      this.showLoading();
      const formData = this.collectFormData();
      
      const response = await fetch('/run-scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        this.showResults(result.output || 'No output received.');
        this.resetRunButton(); // Reset button after successful simulation
      } else {
        this.showError(result.error || 'Unknown server error');
      }
    } catch (error) {
      this.showError(error.message || 'Network error');
    } finally {
      this.hideLoading();
    }
  }
}

// Initialize
const schedulerApp = new SchedulerSimulator();
