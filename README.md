# CPU Scheduling Simulator - Interactive Web Application

A modern, interactive web-based simulator for various CPU scheduling algorithms implemented in C++. This full-stack application provides real-time visualization and performance comparison of different scheduling policies through an intuitive web interface.

![CPU Scheduling Simulator](https://img.shields.io/badge/Status-Active-green) ![Languages](https://img.shields.io/badge/Languages-C%2B%2B%20%7C%20Python%20%7C%20JavaScript%20%7C%20HTML%20%7C%20CSS-blue) ![License](https://img.shields.io/badge/License-MIT-orange)

## 🚀 Features

- **Interactive Web Interface**: Modern, responsive UI for configuring and running simulations
- **Real-time Visualization**: Dynamic Gantt charts and timeline visualizations
- **Multiple Output Modes**: Statistics view and detailed timeline trace
- **Performance Comparison**: Side-by-side algorithm performance analysis
- **8 Scheduling Algorithms**: Complete implementation of major CPU scheduling policies
- **Customizable Parameters**: Adjustable time quantum, process definitions, and simulation length
- **Smart Controls**: Intelligent form validation and change detection

## 🏗️ Architecture

📁 Project Structure
|      
|      🌐 Frontend (Web Interface)
│ ├── index.html # Main UI components
│ ├── styles.css # Modern responsive styling
│ └── app.js # Interactive functionality
|      
|      ⚙️ Backend (Core Engine)
│ ├── server.py # Flask web server
│ └── src/
│ ├── main.cpp # C++ scheduling algorithms
│ ├── parser.h # Input/output parsing
│ └── executable.exe # Compiled scheduler
|      
|      🧪 Testing
│ └── testcases/ # Test scenarios for development
|      
|      📄 Configuration
└── .gitignore


## 🔬 Algorithms Implemented

### 1. **First Come First Serve (FCFS)**
Non-preemptive algorithm where processes are executed in arrival order. Simple but can lead to convoy effect with long processes blocking shorter ones.

### 2. **Round Robin (RR)**
Preemptive time-sharing algorithm with configurable quantum. Each process gets equal CPU time slices, ensuring fairness among processes.

### 3. **Shortest Process Next (SPN)**
Non-preemptive algorithm prioritizing processes with shortest burst time. Minimizes average waiting time but may cause starvation of long processes.

### 4. **Shortest Remaining Time (SRT)**
Preemptive version of SPN. Can interrupt running processes when shorter jobs arrive, providing optimal average waiting time.

### 5. **Highest Response Ratio Next (HRRN)**
Non-preemptive algorithm using response ratio `(waiting_time + service_time) / service_time`. Balances between short jobs and aging of long jobs.

### 6. **Feedback (FB-1)**
Multi-level priority queue system where processes move down priority levels after execution. Uses quantum of 1 for all priority levels.

### 7. **Feedback with Variable Quantum (FB-2i)**
Enhanced feedback system where quantum increases exponentially `(2^i)` with priority level, allowing longer execution for lower priority processes.

### 8. **Aging**
Priority-based scheduling with dynamic priority adjustment to prevent starvation. Increases priority of waiting processes over time.

## 🚀 Quick Start

### Prerequisites
- **Python 3.7+** with Flask
- **G++ compiler** for C++ compilation
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Installation & Setup

1. **Clone the repository**

git clone https://github.com/yourusername/cpu-scheduling-simulator.git
cd cpu-scheduling-simulator


2. **Install Python dependencies**

pip install flask


3. **Compile the C++ scheduler** (if not already compiled)

cd src/
g++ -o executable.exe main.cpp
cd ..


5. **Open your browser**

Python server.py


5. **Open your browser**

http://localhost:5000


## 🎮 How to Use

### 1. **Configure Output Type**
- **Timeline Trace**: Visual Gantt charts with process execution timeline
- **Statistics**: Performance metrics and numerical analysis

### 2. **Select Scheduling Algorithms**
Choose from 8 different algorithms. Multiple selections enable performance comparison.

### 3. **Set Parameters**
- **Time Quantum**: For Round Robin and Aging (1-20)
- **Timeline Length**: Simulation duration (10-100 time units)

### 4. **Define Processes**
Add processes with:
- **Process Name**: Unique identifier
- **Arrival Time**: When process enters the system
- **Burst Time**: CPU time required

### 5. **Run Simulation**
Click "Run Simulation" to see results. The button changes to "Update Results" when parameters are modified.

### 6. **Analyze Results**
- **Individual Algorithm Results**: Detailed statistics and visualizations
- **Performance Comparison Table**: Side-by-side metric comparison
- **Best Performance Highlighting**: Green highlighting for optimal values

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main web application |
| `/run-scheduler` | POST | Execute scheduling simulation |

### Request Format (`/run-scheduler`)

{
"operation": "trace|stats",
"algorithms": "1,2-4,3,5",
"last_instant": 30,
"process_count": 5,
"processes": [
"ProcessA,0,3",
"ProcessB,2,6",
"ProcessC,4,4"
]
}


### Response Format

{
"output": "Formatted simulation results...",
"error": null
}


## 📊 Performance Metrics

The simulator calculates and displays:

- **Turnaround Time**: Total time from arrival to completion
- **Waiting Time**: Time spent waiting in ready queue
- **Response Time**: Time from arrival to first execution
- **Normalized Turnaround**: Turnaround time / service time ratio
- **CPU Utilization**: Percentage of time CPU is busy
- **Throughput**: Number of processes completed per time unit

## 🛠️ Development

### Running Tests

Test individual algorithms using testcases
cd src/
./executable.exe < ../testcases/01-input.txt


### Adding New Algorithms
1. Implement algorithm in `src/main.cpp`
2. Update algorithm selection in `index.html`
3. Add algorithm mapping in `app.js`
4. Create test cases in `testcases/`

### Frontend Development
- **HTML**: Semantic structure with accessibility features
- **CSS**: Modern responsive design with CSS Grid and Flexbox
- **JavaScript**: ES6+ with async/await and modular architecture

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📈 Future Enhancements

- [ ] **Real-time Process Addition**: Add processes during simulation
- [ ] **Advanced Visualizations**: 3D charts and animated transitions
- [ ] **Export Functionality**: Save results as PDF/CSV
- [ ] **Mobile Optimization**: Enhanced mobile responsiveness
- [ ] **Algorithm Customization**: User-defined scheduling policies
- [ ] **Performance Benchmarking**: Large-scale performance testing
- [ ] **Multi-core Simulation**: SMP scheduling algorithms

## 🐛 Known Issues

- Large process counts (>50) may impact visualization performance
- Timeline visualization limited to 100 time units for optimal display
- Browser compatibility varies for advanced CSS features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Operating System Concepts** by Silberschatz, Galvin, and Gagne
- **Modern Operating Systems** by Andrew S. Tanenbaum
- CPU scheduling algorithm research and implementations from academic sources

## 📞 Contact

**Project Maintainer**: [Your Name](mailto:your.email@example.com)

**Project Link**: [https://github.com/yourusername/cpu-scheduling-simulator](https://github.com/yourusername/cpu-scheduling-simulator)

---

<div align="center">

**⭐ Star this repository if it helped you understand CPU scheduling algorithms! ⭐**

</div>
