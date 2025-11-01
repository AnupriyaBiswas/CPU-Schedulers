from flask import Flask, request, jsonify, send_from_directory
import subprocess
import os
import sys

app = Flask(__name__)

# Serve the main HTML page
@app.route('/')
def index():
    return send_from_directory('frontend', 'index.html')

# Serve static files (CSS, JS)
@app.route('/<path:filename>')
def serve_static(filename):
    if filename in ['styles.css', 'app.js']:
        return send_from_directory('frontend', filename)
    return "File not found", 404

@app.route('/run-scheduler', methods=['POST'])
def run_scheduler():
    try:
        data = request.json
        print(f"Received data: {data}")  # Debug print
        
        # Build input text for the C++ program
        input_text = f"{data['operation']}\n{data['algorithms']}\n{data['last_instant']}\n{data['process_count']}\n"
        for process in data['processes']:
            input_text += f"{process}\n"
        
        print(f"Input text:\n{input_text}")  # Debug print
        
        # Check if executable exists
        executable_path = './src/executable.exe'
        if not os.path.exists(executable_path):
            return jsonify({'error': f'Executable not found at {executable_path}. Current directory: {os.getcwd()}'}), 500
        
        # Check if executable is actually executable
        if not os.access(executable_path, os.X_OK):
            return jsonify({'error': f'Executable at {executable_path} is not executable'}), 500
        
        # Run the C++ executable with input
        print(f"Executing: {executable_path}")
        result = subprocess.run(
            [executable_path],
            input=input_text.encode('utf-8'),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=15,
            cwd=os.getcwd()
        )
        
        print(f"Return code: {result.returncode}")
        print(f"Stdout: {result.stdout.decode('utf-8')}")
        print(f"Stderr: {result.stderr.decode('utf-8')}")
        
        if result.returncode != 0:
            stderr_output = result.stderr.decode('utf-8')
            stdout_output = result.stdout.decode('utf-8')
            error_msg = f"Execution failed with return code {result.returncode}.\n"
            error_msg += f"Stderr: {stderr_output}\n"
            error_msg += f"Stdout: {stdout_output}\n"
            error_msg += f"Input was: {input_text}"
            return jsonify({'error': error_msg}), 500
            
        output = result.stdout.decode('utf-8')
        if not output.strip():
            return jsonify({'error': 'No output received from executable'}), 500
            
        return jsonify({'output': output})
        
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Execution timed out (15 seconds)'}), 500
    except FileNotFoundError as e:
        return jsonify({'error': f'File not found: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    print(f"Starting server in directory: {os.getcwd()}")
    print(f"Checking for executable at: ./src/executable.exe")
    if os.path.exists('./src/executable.exe'):
        print("✓ Executable found!")
    else:
        print("✗ Executable NOT found!")
        print("Available files in src/:")
        if os.path.exists('src'):
            print(os.listdir('src'))
        else:
            print("src/ directory doesn't exist!")
    
    app.run(debug=True, host='127.0.0.1', port=5000)
