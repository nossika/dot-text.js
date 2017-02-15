# DotText.js

Make some magic text on canvas! 

## Examples

	<canvas id="example"></canvas>
	<script src="DotText.min.js"></script>
	<script>
		let dt = new DotText(document.querySelector('#example'));
		dt.text('hello!');
	</script>

Click [demo](https://nossika.github.io/DotText.js/demo.html) to try it online.

## Methods

### text(str [,option])
 
Render `str` on canvas.

option:

1. dot_size (*type: Number, default: 5*)

	radius of dot, unit is px.

2. dot_color (*type: Object, default: `{r: 255, g:255, b:255}`*)
	
	color of dot.

3. dot_gap (*type: Number, default: 14*)

	gap of dot, unit is px.

4. text_size (*type: Number, default: 300*)

	font-size of text, unit is px.

5. text_family (*type: String, default: `'Microsoft YaHei', Helvetica, Arial, monospace`*)

	font-family of text.

### clear()

Clear all dots on canvas.

### resize()

Reset dots' position by current size of canvas.

## Tips

* Remember to excute `resize` method to reset dos' position when canvas size changed. The `resize` method has 200ms delay so don't worry about the performance.


