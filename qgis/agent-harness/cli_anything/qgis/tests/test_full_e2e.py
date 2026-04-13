"""E2E tests for cli-anything-qgis.

Tests the installed CLI command via subprocess calls.
Does NOT import any project modules directly.
"""

import subprocess
import sys
import json
import os
import shutil
import tempfile
import pytest

def _resolve_cli(name="cli-anything-qgis"):
    """Resolve CLI command path.
    
    Respects CLI_ANYTHING_FORCE_INSTALLED env var:
    - When set: require command to exist in PATH
    - When not set: fall back to project dir
    """
    if os.environ.get("CLI_ANYTHING_FORCE_INSTALLED"):
        path = shutil.which(name)
        if path is None:
            pytest.skip(f"{name} not found in PATH (CLI_ANYTHING_FORCE_INSTALLED=1)")
        return path
    # Fallback: try in PATH or local install
    path = shutil.which(name)
    if path:
        return path
    pytest.skip(f"{name} not found — run 'pip install -e .' first")

def _run(*args, expect_fail=False):
    """Run CLI command and return result."""
    cmd = [_resolve_cli()] + list(args)
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if not expect_fail:
        assert result.returncode == 0, f"Command failed: {cmd}\nstderr: {result.stderr}"
    return result


class TestCLISubprocess:
    """Test installed CLI command via subprocess."""
    
    def test_help_output(self):
        """--help shows usage information."""
        result = _run("--help")
        assert "qgis" in result.stdout.lower() or "QGIS" in result.stdout
    
    def test_info_version(self):
        """info shows version information."""
        result = _run("info")
        # Either shows version or says QGIS not available
        assert result.returncode in (0, 1)
    
    def test_info_version_json(self):
        """info --json returns parseable JSON."""
        result = _run("--json", "info")
        if result.returncode == 0:
            data = json.loads(result.stdout)
            assert isinstance(data, dict)

    def test_process_list(self):
        """process list shows algorithms or graceful message."""
        result = _run("process", "list")
        assert result.returncode == 0, f"stderr: {result.stderr}"
    
    def test_process_list_json(self):
        """--json process list returns parseable JSON."""
        result = _run("--json", "process", "list")
        if result.returncode == 0:
            data = json.loads(result.stdout)
            assert isinstance(data, (dict, list))
    
    def test_process_info_missing_algo(self):
        """process info with non-existent algorithm returns error or graceful message."""
        result = _run("process", "info", "nonexistent:algo")
        # When QGIS is not installed, returns 0 with graceful message
        assert result.returncode in (0, 1)
    
    def test_convert_no_input(self):
        """convert vector with no input shows usage/error."""
        result = _run("convert", "vector", expect_fail=True)
        assert result.returncode != 0
    
    def test_shell_repl_starts(self):
        """shell command is recognized (may need QGIS)."""
        result = _run("shell", "--help")
        assert result.returncode in (0, 1)


class TestOutputFormats:
    """Test output format options."""
    
    def test_table_output(self):
        """Default mode produces human-readable output."""
        result = _run("process", "list")
        # Should have some output (even if QGIS not available)
        assert result.stdout or result.returncode != 0
    
    def test_json_output_parsable(self):
        """--json flag produces valid JSON."""
        result = _run("--json", "info")
        if result.returncode == 0:
            output = result.stdout.strip()
            parsed = json.loads(output)
            assert isinstance(parsed, dict)


class TestErrorHandling:
    """Test CLI error handling."""
    
    def test_invalid_command(self):
        """Invalid command returns non-zero exit code."""
        result = _run("invalid_command_xyz", expect_fail=True)
        assert result.returncode != 0
    
    def test_missing_required_arg(self):
        """Missing required argument shows error."""
        result = _run("convert", "vector", expect_fail=True)
        assert result.returncode != 0
