import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
    input: 'dot-text.js',
    output: {
        file: 'dot-text.min.js',
        format: 'umd',
        name: 'DotText',
    },
    plugins: [
        babel(),
        uglify(),
    ]
};