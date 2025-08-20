$ErrorActionPreference = 'Stop'

function Write-Info($message) { Write-Host $message -ForegroundColor Cyan }
function Write-Success($message) { Write-Host $message -ForegroundColor Green }
function Write-Warn($message) { Write-Host $message -ForegroundColor Yellow }
function Write-ErrorMsg($message) { Write-Host $message -ForegroundColor Red }

function Get-PythonCmd {
    $candidates = @('python', 'py')
    foreach ($cmd in $candidates) {
        try {
            & $cmd --version *> $null
            return $cmd
        } catch { }
    }
    throw "Python is not installed or not on PATH. Install Python 3.x from https://www.python.org/downloads/ and try again."
}

try {
    Write-Info "Checking for Python..."
    $python = Get-PythonCmd
    Write-Success "Found Python command: $python"

    $venvDir = Join-Path $PSScriptRoot ".venv"
    $activatePath = Join-Path $venvDir "Scripts/Activate.ps1"

    if (-not (Test-Path $activatePath)) {
        Write-Info "Creating virtual environment at '$venvDir'..."
        & $python -m venv $venvDir
        Write-Success "Virtual environment created."
    } else {
        Write-Info "Virtual environment already exists."
    }

    Write-Info "Activating virtual environment..."
    . $activatePath

    if (-not $env:VIRTUAL_ENV) {
        throw "Failed to activate the virtual environment."
    }
    Write-Success "Virtual environment is active: $env:VIRTUAL_ENV"

    Write-Info "Upgrading pip to the latest version..."
    & python -m pip install --upgrade pip
    Write-Success "pip upgraded."

    $reqPath = Join-Path $PSScriptRoot "requirements.txt"
    if (Test-Path $reqPath) {
        Write-Info "Installing dependencies from requirements.txt..."
        & python -m pip install -r $reqPath
        Write-Success "Dependencies installed."
    } else {
        Write-Warn "No requirements.txt found. Skipping dependency installation."
    }

    Write-Success "Setup complete. Virtual environment is active."
    Write-Info "Python executable: $(python -c "import sys; print(sys.executable)")"
    Write-Info "To use this environment in the current shell later, run: . .\.venv\Scripts\Activate.ps1"
} catch {
    Write-ErrorMsg $_.Exception.Message
    exit 1
}


