# Kamil
> An autocomplete library written in pure JS. <a href="http://oss6.github.io/kamil/">http://oss6.github.io/kamil/</a>

## Install
### Download
Download the zip file containing kamil.min.js and kamil.min.css from here.

### Bower
Using bower, run the following:
```bash
bower install --save kamil
```


## Basic usage
The basic usage of the Kamil autocomplete is very simple to configure:

```html
<input id="tags" type="text">
```

```javascript
var tags = ["ActionScript", "AppleScript", "Asp", "BASIC", "C", "C++", "Clojure", "COBOL", ... ]
var autoComplete = new Kamil('#tags', { source: tags });
```

For more examples check the above web site.

## Documentation
The widget documentation is available here: <a href="http://oss6.github.io/kamil/">http://oss6.github.io/kamil/</a>

## License
MIT © [Ossama Edbali](http://oss6.github.io)