from setuptools import setup, find_namespace_packages
import os

# Read README for long description
readme_path = os.path.join(os.path.dirname(__file__), "cli_anything", "qgis", "README.md")
long_description = ""
if os.path.exists(readme_path):
    with open(readme_path, encoding="utf-8") as f:
        long_description = f.read()

setup(
    name="cli-anything-qgis",
    version="0.1.0",
    description="CLI harness for QGIS - command-line interface for QGIS processing, data conversion, and map export",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="cli-anything",
    url="https://github.com/cli-anything/cli-anything-qgis",
    license="GPL-2.0-or-later",
    packages=find_namespace_packages(include=["cli_anything.*"]),
    python_requires=">=3.8",
    install_requires=[
        "click>=8.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0",
            "pytest-cov>=4.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "cli-anything-qgis=cli_anything.qgis.qgis_cli:cli",
        ],
    },
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Environment :: Console",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: GNU General Public License v2 or later (GPLv2+)",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Scientific/Engineering :: GIS",
    ],
)
