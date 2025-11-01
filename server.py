from flask import Flask, request, jsonify, send_from_directory
import subprocess
import os
import sys
import tempfile

app = Flask(__name__)

# Serve the main HTML page
@app.route('/')
def index():
    # CHANGE: Remove 'frontend' folder since your files are in root
    return send_from_directory('.', 'index.html')

# Serve static files (CSS, JS)
@app.route('/<path:filename>')
def serve_static(filename):
    if filename in ['styles.css', 'app.js']:
        # CHANGE: Remove 'frontend' folder reference
        return send_from_directory('.', filename)
    return "File not found", 404

@app.route('/run-scheduler', methods=['POST'])
def run_scheduler():
    try:
        data = request.json
        print(f"Received data: {data}")  # Debug print
        
        # CHANGE: Use temporary file instead of direct input (more reliable)
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as temp_file:
            temp_file.write(f"{data['operation']}\n")
            temp_file.write(f"{data['algorithms']}\n")
            temp_file.write(f"{data['last_instant']}\n")
            temp_file.write(f"{data['process_count']}\n")
            
            for process in data['processes']:
                temp_file.write(f"{process}\n")
            
            temp_filename = temp_file.name
        
        # CHANGE: Handle both .exe and non-.exe versions for cross-platform
        executable_path = './src/executable'  # Linux/Mac (Render uses Linux)
        if not os.path.exists(executable_path):
            executable_path = './src/executable.exe'  # Windows fallback
        
        if not os.path.exists(executable_path):
            return jsonify({'error': f'Executable not found. Current directory: {os.getcwd()}. Contents: {os.listdir(".")}'})
        
        print(f"Executing: {executable_path}")
        result = subprocess.run(
            [executable_path],
            stdin=open(temp_filename, 'r'),  # CHANGE: Use file input instead of pipe
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=30,  # CHANGE: Increase timeout for complex calculations
            text=True  # CHANGE: Use text=True instead of manual encoding
        )
        
        # Clean up temporary file
        os.unlink(temp_filename)
        
        print(f"Return code: {result.returncode}")
        print(f"Stdout: {result.stdout}")
        print(f"Stderr: {result.stderr}")
        
        if result.returncode != 0:
            error_msg = f"Execution failed with return code {result.returncode}.\n"
            error_msg += f"Stderr: {result.stderr}\n"
            error_msg += f"Stdout: {result.stdout}"
            return jsonify({'error': error_msg}), 500
            
        output = result.stdout
        if not output.strip():
            return jsonify({'error': 'No output received from executable'}), 500
            
        return jsonify({'output': output})
        
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Execution timed out (30 seconds)'}), 500
    except FileNotFoundError as e:
        return jsonify({'error': f'File not found: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    # CHANGE: Production-ready configuration
    port = int(os.environ.get('PORT', 5000))  # Render provides PORT env var
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"Starting server in directory: {os.getcwd()}")
    print(f"Checking for executable...")
    
    # Check both possible executable names
    exe_found = False
    for exe_name in ['./src/executable', './src/executable.exe']:
        if os.path.exists(exe_name):
            print(f"✓ Executable found: {exe_name}")
            exe_found = True
            break
    
    if not exe_found:
        print("✗ Executable NOT found!")
        print("Available files in src/:")
        if os.path.exists('src'):
            print(os.listdir('src'))
        else:
            print("src/ directory doesn't exist!")
    
    # CHANGE: Bind to 0.0.0.0 for Render (not 127.0.0.1)
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
