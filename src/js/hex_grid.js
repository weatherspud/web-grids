(function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const HEX_RADIUS = 1 / Math.sqrt(3);
  const HEX_VERTEX_ANGLES = [0, 1, 2, 3, 4, 5].map(function (n) {
    return (2 * n) * Math.PI / 6;
  });
  const HEX_VERTEX_ANGLES_30 = [0, 1, 2, 3, 4, 5].map(function (n) {
    return (2 * n + 1) * Math.PI / 6;
  });
  const COORDINATE_STYLE_ALPHANUMERIC = 'alphanumeric';
  const COORDINATE_STYLE_NUMERIC = 'numeric';
  const COORDINATE_STYLE_NONE = 'none';
  const DEFAULT_SCALE = 80;

  const int_to_alpha = function (n) {
    return ' ' + String.fromCharCode((n - 1) % 26 + 65);
  };

  class Hex {
    constructor (x, y, scale = 1, row = 1, column = 1, coordinate_style = COORDINATE_STYLE_NUMERIC) {
      this.x = x;
      this.y = y;
      this.scale = scale;
      this.row = row;
      this.column = column;
      this.coordinate_style = coordinate_style;
      this.radius = HEX_RADIUS * scale;
      this.font_size = 12;
      this.font_family = 'Arial';
    }

    _corners (hex_vertex_angles) {
      const x = this.x;
      const y = this.y;
      const radius = this.radius;
      return hex_vertex_angles.map(function (angle) {
        return [
          x + radius * Math.cos(angle),
          y + radius * Math.sin(angle)
        ];
      });
    }

    corners () {
      return this._corners(HEX_VERTEX_ANGLES);
    }

    text () {
      const col = this.column < 10 ? '0' + this.column : '' + this.column;
      const row = this.row < 10 ? '0' + this.row : '' + this.row;
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('x', this.x - this.radius * 0.25);
      text.setAttribute('y', this.y - this.radius * 0.55);
      text.setAttribute('font-family', this.font_family);
      text.setAttribute('font-size', this.font_size);
      if (this.coordinate_style === COORDINATE_STYLE_NUMERIC) {
        text.textContent = col + row;
      } else if (this.coordinate_style === COORDINATE_STYLE_ALPHANUMERIC) {
        text.textContent = int_to_alpha(col) + row;
      } else {
        throw new Error('unsupported coordinate style: ' + this.coordinate_style);
      }

      return text;
    }

    polygon () {
      const points_value = this.corners().map(function (point) { return point.join(','); }).join(',');
      const polygon = document.createElementNS(SVG_NS, 'polygon');
      polygon.setAttribute('points', points_value);
      polygon.setAttribute('stroke-mitrelimit', 1);
      polygon.setAttribute('stroke', 'black');
      polygon.setAttribute('fill', 'none');

      return polygon;
    }

    elements () {
      let retval = [];
      retval.push(this.polygon());
      if (this.coordinate_style !== COORDINATE_STYLE_NONE) {
        retval.push(this.text());
      }

      return retval;
    }
  }

  class Hex30 extends Hex {
    corners () {
      return this._corners(HEX_VERTEX_ANGLES_30);
    }
  }

  const row_column_to_x_y_center = function (row, column, start_row, start_column, origin_x = 0, origin_y = 0, scale = 1) {
    let y = scale * ((row - start_row + 1) + ((column - start_column + 1) % 2 === 0 ? 0.5 : 0)) + origin_y;
    let x = scale * (Math.sqrt(3) / 2) * (column - start_column + 1) + origin_x;

    return [x, y];
  };

  const row_column_to_x_y_center_30 = function (row, column, start_row, start_column, origin_x = 0, origin_y = 0, scale = 1) {
    let x = scale * ((column - start_column + 1) + ((row - start_row + 1) % 2 === 0 ? 0.5 : 0)) + origin_x;
    let y = scale * (Math.sqrt(3) / 2) * (row - start_row + 1) + origin_y;

    return [x, y];
  };

  const superhex_grid = function (side_length, minCol, minRow, coordinate_style, origin_x = 0, origin_y = 0, scale = DEFAULT_SCALE) {
    // FIXME: minCol/minRow and start_col/start_row are confusing
    let superhex_grid = [];
    for (let col = 1; col <= 2 * side_length - 1; ++col) {
      let start_row = 0;
      let start_row_adjust = 0;
      let end_row = 0;
      let end_row_adjust = 0;
      if (col <= side_length) {
        start_row_adjust = Math.floor((col - 1) / 2);
        end_row_adjust = Math.floor(col / 2);
        start_row = 1 - (col - 1) + start_row_adjust;
        end_row = side_length + (col - 1) - end_row_adjust;
      } else {
        start_row_adjust = Math.floor(((2 * side_length - col) - 1) / 2);
        end_row_adjust = Math.floor((2 * side_length - col) / 2);
        start_row = 1 - (2 * side_length - 1 - col) + start_row_adjust;
        end_row = side_length + (2 * side_length - 1 - col) - end_row_adjust;
      }
      for (let row = start_row; row <= end_row; ++row) {
        const x_y = row_column_to_x_y_center(row, col, 1, 1, origin_x, origin_y, scale);
        const hex = new Hex(x_y[0], x_y[1], scale, row + minRow - 1, col + minCol - 1, coordinate_style);
        superhex_grid = superhex_grid.concat(hex.elements());
      }
    }

    return superhex_grid;
  };

  const superhex_grid_30 = function (side_length, minCol, minRow, coordinate_style, origin_x = 0, origin_y = 0, scale = DEFAULT_SCALE) {
    // FIXME: minCol/minRow and start_col/start_row are confusing
    let superhex_grid = [];
    for (let row = 1; row <= 2 * side_length - 1; ++row) {
      let start_col = 0;
      let start_col_adjust = 0;
      let end_col = 0;
      let end_col_adjust = 0;
      if (row <= side_length) {
        start_col_adjust = Math.floor((row - 1) / 2);
        end_col_adjust = Math.floor(row / 2);
        start_col = 1 - (row - 1) + start_col_adjust;
        end_col = side_length + (row - 1) - end_col_adjust;
      } else {
        start_col_adjust = Math.floor(((2 * side_length - row) - 1) / 2);
        end_col_adjust = Math.floor((2 * side_length - row) / 2);
        start_col = 1 - (2 * side_length - 1 - row) + start_col_adjust;
        end_col = side_length + (2 * side_length - 1 - row) - end_col_adjust;
      }
      for (let col = start_col; col <= end_col; ++col) {
        const x_y = row_column_to_x_y_center_30(row, col, 1, 1, origin_x, origin_y, scale);
        const hex = new Hex30(x_y[0], x_y[1], scale, row + minRow - 1, col + minCol - 1, coordinate_style);
        superhex_grid = superhex_grid.concat(hex.elements());
      }
    }
    return superhex_grid;
  };

  const grid = function (width, height, start_col, start_row, coordinate_style, origin_x = 0, origin_y = 0, scale = 80, rotate_30 = false) {
    let grid = [];
    for (let row = start_row; row <= height + start_row - 1; ++row) {
      for (let col = start_col; col <= width + start_col - 1; ++col) {
        let hex = null;
        if (rotate_30) {
          const x_y = row_column_to_x_y_center_30(row, col, start_row, start_col, origin_x, origin_y, scale);
          hex = new Hex30(x_y[0], x_y[1], scale, row, col, coordinate_style);
        } else {
          const x_y = row_column_to_x_y_center(row, col, start_row, start_col, origin_x, origin_y, scale);
          hex = new Hex(x_y[0], x_y[1], scale, row, col, coordinate_style);
        }
        grid = grid.concat(hex.elements());
      }
    }

    return grid;
  };

  const render_rectangular_form = function (url) {
    let form = document.createElement('form');
    form.setAttribute('method', 'get');
    form.setAttribute('action', url.origin + url.pathname);

    let input_superhex = document.createElement('input');
    input_superhex.setAttribute('type', 'hidden');
    input_superhex.setAttribute('name', 'superhex');
    input_superhex.setAttribute('value', '0');
    form.appendChild(input_superhex);

    let label_x = document.createElement('label');
    label_x.textContent = 'Rows:';
    form.appendChild(label_x);

    let input_x = document.createElement('input');
    input_x.setAttribute('name', 'rows');
    input_x.setAttribute('type', 'text');
    input_x.setAttribute('value', '10');
    form.appendChild(input_x);

    form.appendChild(document.createElement('br'));

    let label_y = document.createElement('label');
    label_y.textContent = 'Columns:';
    form.appendChild(label_y);

    let input_y = document.createElement('input');
    input_y.setAttribute('name', 'columns');
    input_y.setAttribute('type', 'text');
    input_y.setAttribute('value', '8');
    form.appendChild(input_y);

    form.appendChild(document.createElement('br'));

    let label_start_row = document.createElement('label');
    label_start_row.textContent = 'Start Row:';
    form.appendChild(label_start_row);

    let input_start_row = document.createElement('input');
    input_start_row.setAttribute('name', 'start_row');
    input_start_row.setAttribute('type', 'text');
    input_start_row.setAttribute('value', '1');
    form.appendChild(input_start_row);

    form.appendChild(document.createElement('br'));

    let label_start_col = document.createElement('label');
    label_start_col.textContent = 'Start Column:';
    form.appendChild(label_start_col);

    let input_start_col = document.createElement('input');
    input_start_col.setAttribute('name', 'start_column');
    input_start_col.setAttribute('type', 'text');
    input_start_col.setAttribute('value', '1');
    form.appendChild(input_start_col);

    form.appendChild(document.createElement('br'));

    let input_coordinate_style_alphanumeric = document.createElement('input');
    input_coordinate_style_alphanumeric.setAttribute('type', 'radio');
    input_coordinate_style_alphanumeric.setAttribute('name', 'coordinate_style');
    input_coordinate_style_alphanumeric.setAttribute('value', 'alphanumeric');
    input_coordinate_style_alphanumeric.setAttribute('checked', 'checked');
    form.appendChild(input_coordinate_style_alphanumeric);

    let label_coordinate_style_alphanumeric = document.createElement('label');
    label_coordinate_style_alphanumeric.textContent = 'alphanumeric coordinates';
    form.appendChild(label_coordinate_style_alphanumeric);

    form.appendChild(document.createElement('br'));

    let input_coordinate_style_numeric = document.createElement('input');
    input_coordinate_style_numeric.setAttribute('type', 'radio');
    input_coordinate_style_numeric.setAttribute('name', 'coordinate_style');
    input_coordinate_style_numeric.setAttribute('value', 'numeric');
    form.appendChild(input_coordinate_style_numeric);

    let label_coordinate_style_numeric = document.createElement('label');
    label_coordinate_style_numeric.textContent = 'numeric coordinates';
    form.appendChild(label_coordinate_style_numeric);

    form.appendChild(document.createElement('br'));

    let input_coordinate_style_none = document.createElement('input');
    input_coordinate_style_none.setAttribute('type', 'radio');
    input_coordinate_style_none.setAttribute('name', 'coordinate_style');
    input_coordinate_style_none.setAttribute('value', 'none');
    form.appendChild(input_coordinate_style_none);

    let label_coordinate_style_none = document.createElement('label');
    label_coordinate_style_none.textContent = 'no coordinates';
    form.appendChild(label_coordinate_style_none);

    form.appendChild(document.createElement('br'));

    let submit = document.createElement('input');
    submit.setAttribute('type', 'submit');
    submit.setAttribute('value', 'Create Rectangular Grid of Hexes');
    form.appendChild(submit);
    document.body.appendChild(form);
  };

  const render_superhex_form = function (url) {
    let form = document.createElement('form');
    form.setAttribute('method', 'get');
    form.setAttribute('action', url.origin + url.pathname);

    let input_superhex = document.createElement('input');
    input_superhex.setAttribute('type', 'hidden');
    input_superhex.setAttribute('name', 'superhex');
    input_superhex.setAttribute('value', '1');
    form.appendChild(input_superhex);

    let input_rotate30 = document.createElement('input');
    input_rotate30.setAttribute('type', 'checkbox');
    input_rotate30.setAttribute('name', 'rotate30');
    input_rotate30.setAttribute('value', '1');
    form.appendChild(input_rotate30);

    let label_rotate30 = document.createElement('label');
    label_rotate30.textContent = 'Rotate Hexes 30 Degrees';
    form.appendChild(label_rotate30);

    form.appendChild(document.createElement('br'));

    let label_x = document.createElement('label');
    label_x.textContent = 'Hexes per Side:';
    form.appendChild(label_x);

    let input_x = document.createElement('input');
    input_x.setAttribute('name', 'rows');
    input_x.setAttribute('type', 'text');
    input_x.setAttribute('value', '6');
    form.appendChild(input_x);

    let input_y = document.createElement('input');
    input_y.setAttribute('name', 'columns');
    input_y.setAttribute('type', 'hidden');
    input_y.setAttribute('value', '1');
    form.appendChild(input_y);

    form.appendChild(document.createElement('br'));

    let label_start_row = document.createElement('label');
    label_start_row.textContent = 'Start Row:';
    form.appendChild(label_start_row);

    let input_start_row = document.createElement('input');
    input_start_row.setAttribute('name', 'start_row');
    input_start_row.setAttribute('type', 'text');
    input_start_row.setAttribute('value', '1');
    form.appendChild(input_start_row);

    form.appendChild(document.createElement('br'));

    let label_start_col = document.createElement('label');
    label_start_col.textContent = 'Start Column:';
    form.appendChild(label_start_col);

    let input_start_col = document.createElement('input');
    input_start_col.setAttribute('name', 'start_column');
    input_start_col.setAttribute('type', 'text');
    input_start_col.setAttribute('value', '1');
    form.appendChild(input_start_col);

    form.appendChild(document.createElement('br'));

    let input_coordinate_style_alphanumeric = document.createElement('input');
    input_coordinate_style_alphanumeric.setAttribute('type', 'radio');
    input_coordinate_style_alphanumeric.setAttribute('name', 'coordinate_style');
    input_coordinate_style_alphanumeric.setAttribute('value', 'alphanumeric');
    input_coordinate_style_alphanumeric.setAttribute('checked', 'checked');
    form.appendChild(input_coordinate_style_alphanumeric);

    let label_coordinate_style_alphanumeric = document.createElement('label');
    label_coordinate_style_alphanumeric.textContent = 'alphanumeric coordinates';
    form.appendChild(label_coordinate_style_alphanumeric);

    form.appendChild(document.createElement('br'));

    let input_coordinate_style_numeric = document.createElement('input');
    input_coordinate_style_numeric.setAttribute('type', 'radio');
    input_coordinate_style_numeric.setAttribute('name', 'coordinate_style');
    input_coordinate_style_numeric.setAttribute('value', 'numeric');
    form.appendChild(input_coordinate_style_numeric);

    let label_coordinate_style_numeric = document.createElement('label');
    label_coordinate_style_numeric.textContent = 'numeric coordinates';
    form.appendChild(label_coordinate_style_numeric);

    form.appendChild(document.createElement('br'));

    let input_coordinate_style_none = document.createElement('input');
    input_coordinate_style_none.setAttribute('type', 'radio');
    input_coordinate_style_none.setAttribute('name', 'coordinate_style');
    input_coordinate_style_none.setAttribute('value', 'none');
    form.appendChild(input_coordinate_style_none);

    let label_coordinate_style_none = document.createElement('label');
    label_coordinate_style_none.textContent = 'no coordinates';
    form.appendChild(label_coordinate_style_none);

    form.appendChild(document.createElement('br'));

    let submit = document.createElement('input');
    submit.setAttribute('type', 'submit');
    submit.setAttribute('value', 'Create Superhex');
    form.appendChild(submit);
    document.body.appendChild(form);
  };

  const render_forms = function (url) {
    render_rectangular_form(url);
    render_superhex_form(url);
  };

  const render = function (url_string) {
    let url = new URL(url_string);
    let rowsParam = url.searchParams.get('rows');
    let columnsParam = url.searchParams.get('columns');
    let startRowParam = url.searchParams.get('start_row') || '1';
    let startColParam = url.searchParams.get('start_column') || '1';
    let coordinate_style = url.searchParams.get('coordinate_style') || COORDINATE_STYLE_ALPHANUMERIC;

    if (rowsParam && columnsParam) {
      let rows = parseInt(rowsParam);
      let columns = parseInt(columnsParam);
      let startRow = parseInt(startRowParam);
      let startCol = parseInt(startColParam);
      let svg = document.createElementNS(SVG_NS, 'svg');
      if (url.searchParams.get('superhex') === '1') {
        if (url.searchParams.get('rotate30') === '1') {
          svg.setAttribute('width', Math.ceil(DEFAULT_SCALE * rows * 2));
          svg.setAttribute('height', Math.ceil(DEFAULT_SCALE * rows * Math.sqrt(3)));
          superhex_grid_30(rows, startCol, startRow, coordinate_style, (DEFAULT_SCALE / 2) * (rows - 1), 0).forEach(function (element) {
            svg.appendChild(element);
          });
        } else {
          svg.setAttribute('width', Math.ceil(DEFAULT_SCALE * rows * Math.sqrt(3)));
          svg.setAttribute('height', Math.ceil(DEFAULT_SCALE * rows * 2));
          superhex_grid(rows, startCol, startRow, coordinate_style, 0, (DEFAULT_SCALE / 2) * (rows - 1)).forEach(function (element) {
            svg.appendChild(element);
          });
        }
      } else {
        if (url.searchParams.get('rotate30') === '1') {
          // FIXME: 90 and 120 should depend on DEFAULT_SCALE
          svg.setAttribute('height', Math.ceil(DEFAULT_SCALE * rows * Math.sqrt(3) / 2) + 90);
          svg.setAttribute('width', columns * DEFAULT_SCALE + 120);
          grid(columns, rows, startCol, startRow, coordinate_style, 0, 0, 80, true).forEach(function (element) {
            svg.appendChild(element);
          });
        } else {
          // FIXME: 90 and 120 should depend on DEFAULT_SCALE
          svg.setAttribute('width', Math.ceil(DEFAULT_SCALE * columns * Math.sqrt(3) / 2) + 90);
          svg.setAttribute('height', rows * DEFAULT_SCALE + 120);
          grid(columns, rows, startCol, startRow, coordinate_style).forEach(function (element) {
            svg.appendChild(element);
          });
        }
      }
      document.body.appendChild(svg);
    } else {
      render_forms(url);
    }
  };

  render(window.location.href);
})();
