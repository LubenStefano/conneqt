import { Directive, ElementRef, Input, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appFlowHighlight]',
  standalone: true,
})
export class FlowHighlightDirective implements OnInit {
  @Input('appFlowHighlight') isActive: boolean = false; // Input determines if the flow is active

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.updateStyles();
  }

  ngOnChanges(): void {
    this.updateStyles();
  }

  private updateStyles(): void {
    if (this.isActive) {
      this.renderer.setStyle(
        this.el.nativeElement,
        'background-color',
        '#e3e3e3'
      );
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'background-color');
    }
  }
}
