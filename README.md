# dot-text.js

Draw texts, which are composed of dots, with shifting animation on canvas.

## Examples

	<canvas id="example"></canvas>
	<script src="dot-text.min.js"></script>
	<script>
		let dt = new DotText(document.querySelector('#example'));
		dt.text('hello!');
	</script>

Click [DEMO](https://nossika.github.io/dot-text.js/demo.html) to try it!

## Methods

### text(str, option)
 
Render `str` on canvas.

params: 

* **str** (required, type: String)

* **option** (optional, type: Object)

	* **dotSize** (type: Number, default: 5): radius of dot, unit is px.

	* **dotColor** (type: Object, default: `{r: 255, g:255, b:255}`): color of dot.

	* **gap** (type: Number, default: 14): gap of dot, unit is px.

	* **textSize** (type: Number, default: 300): font-size of text, unit is px.

	* **textFamily** (type: String, default: " 'Microsoft YaHei', Helvetica, Arial, monospace "): font-family of text.

### clear()

Clear all dots on canvas.

### resize()

Reset dots' position by current size of canvas.

## Tips

* Remember to excute `resize` method to reset dos' position when canvas size changed. The `resize` method has 100ms debounce so don't worry about the performance.


