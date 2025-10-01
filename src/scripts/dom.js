export class DOM {
    static createColumn(columnData) {
        const column = document.createElement('div');
        column.className = 'column';
        column.dataset.columnId = columnData.id;

        column.innerHTML = `
            <div class="column-header">${columnData.title}</div>
            <div class="cards-container" data-column="${columnData.id}">
                ${columnData.cards.map(card => this.createCardHTML(card)).join('')}
            </div>
            <div class="add-card-form hidden">
                <textarea class="add-card-textarea" placeholder="Введите описание карточки..."></textarea>
                <div class="add-card-buttons">
                    <button class="btn btn-primary add-card-confirm">Добавить карточку</button>
                    <button class="btn btn-secondary add-card-cancel">✕</button>
                </div>
            </div>
            <button class="add-card-btn">+ Добавить карточку</button>
        `;

        return column;
    }

    static createCardHTML(card) {
        return `
            <div class="card" draggable="true" data-card-id="${card.id}">
                ${card.text}
                <button class="card-delete">✕</button>
            </div>
        `;
    }

    static createCardPlaceholder() {
        const placeholder = document.createElement('div');
        placeholder.className = 'card-placeholder';
        return placeholder;
    }
}