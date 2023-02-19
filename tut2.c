List copyListRec(List li) {
    if (li == NULL) {
        return NULL;
    }

    List copy = copyListRec(li->next);
    copy = addItem(li->item, copy)
    return copy;
}

List removeAllFromListRec(List li, int n) {
    if (li == NULL) {
        return NULL;
    }

    if (list->item == n) {
        List prev = li;
        li = removeAllFromListRec(li->next, n); // replaces current element with the next element (with every n removed)
        free(prev); // frees the previous node that just got removed
    } else {
        li->next = removeAllFromListRec(li-next, n); // the next elment is the next element, advance (with every n removed)
    }

    return li;
}