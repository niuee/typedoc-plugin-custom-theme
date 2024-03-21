// rollup.config.js
import typescript from '@rollup/plugin-typescript';
// import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
// import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
// import generatePackageJson from 'rollup-plugin-generate-package-json';
import path from 'path';
const packageJson = require("./package.json");



const fs = require('fs');

const plugins = [
    resolve(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      // useTsconfigDeclarationDir: true,
    }),
    terser({
      mangle: false,
    }),
]

export const getComponentsFolders = (entry) => {
   const dirs = fs.readdirSync(entry)
   const dirsWithoutIndex = dirs.filter(name => name !== 'index.ts' && name !== 'utils')
   return dirsWithoutIndex
};

export const getComponentsFoldersRecursive = (entry) => {
  const finalListOfDirs = [];
  const dirs = fs.readdirSync(entry)
  while (dirs.length !== 0){
    const length = dirs.length;
    for(let i=0; i < length; i++){
      const dir = dirs.shift();
      if(fs.statSync(path.resolve(entry, dir)).isDirectory()){
        if (entry === './src') {
          finalListOfDirs.push(dir);   
        } else {
          finalListOfDirs.push(path.join(entry, dir));
        }
        const subDirs = fs.readdirSync(path.resolve(entry, dir));
        dirs.push(...subDirs.map(subDir => path.join(dir, subDir)));
      }
    }
  } 
  return finalListOfDirs;
};

const componentDirectories = getComponentsFoldersRecursive('./src');

export default [
  {
    input: 'src/index.tsx',
    output: [{
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
    }],
    plugins: [
      resolve(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
      terser({
        mangle: false,
      }),
    ],
    external: ['typedoc']
  }
];