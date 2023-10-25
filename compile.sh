#!/bin/bash
cd huff/ && rm -f ./contract.hex && huffc contract.huff --bytecode >> contract.hex && cd ..