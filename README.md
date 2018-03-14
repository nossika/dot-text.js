# DotText.js

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

	* **dot_size** (type: Number, default: 5): radius of dot, unit is px.

	* **dot_color** (type: Object, default: `{r: 255, g:255, b:255}`): color of dot.

	* **dot_gap** (type: Number, default: 14): gap of dot, unit is px.

	* **text_size** (type: Number, default: 300): font-size of text, unit is px.

	* **text_family** (type: String, default: " 'Microsoft YaHei', Helvetica, Arial, monospace "): font-family of text.

### clear()

Clear all dots on canvas.

### resize()

Reset dots' position by current size of canvas.

## Tips

* Remember to excute `resize` method to reset dos' position when canvas size changed. The `resize` method has 200ms delay so don't worry about the performance.


