import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import NavBar from "../../Util/NavBar";
import '../../styles/ordersHistoryScreen.css';

const PAGE_SIZE = 100;
const SCAN_BATCH_SIZE = 20;
const CACHE_KEY = 'pista_orders_history_cache';

function OrdersHistoryScreen() {
  const history = useHistory();

  const [maxOrderId, setMaxOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tafelFilter, setTafelFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = newest first, 'asc' = oldest first

  // Every loaded page of results, plus the id to resume scanning from for a new page
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [cachedAt, setCachedAt] = useState(null);

  const orderExists = async (id) => {
    if (id < 1) return false;
    const response = await fetch(`https://lapista.depistezulte.be/api/order/${id}`);
    return response.ok;
  };

  const findMaxOrderId = async () => {
    let high = 1;
    while (await orderExists(high)) {
      high *= 2;
    }
    let low = Math.floor(high / 2);
    while (low + 1 < high) {
      const mid = Math.floor((low + high) / 2);
      if (await orderExists(mid)) {
        low = mid;
      } else {
        high = mid;
      }
    }
    return low;
  };

  // The date filter inputs are plain Belgian calendar dates, so the order's UTC
  // timestamp must be converted to its Europe/Brussels calendar date before comparing
  // (a straight slice of the ISO string can be off by a day around midnight).
  const toBrusselsDateString = (isoString) => {
    if (!isoString) return null;
    return new Date(isoString).toLocaleDateString('en-CA', { timeZone: 'Europe/Brussels' });
  };

  const matchesFilters = (order, filters) => {
    if (filters.tafel.trim() && !String(order.tafel_id).toLowerCase().includes(filters.tafel.trim().toLowerCase())) {
      return false;
    }
    const orderDate = toBrusselsDateString(order.creation);
    if (filters.from && (!orderDate || orderDate < filters.from)) {
      return false;
    }
    if (filters.to && (!orderDate || orderDate > filters.to)) {
      return false;
    }
    return true;
  };

  const isInRange = (id, max) => id >= 1 && id <= max;

  // Orders can only be looked up one by one (no bulk endpoint), so a page is built by
  // scanning in small batches - backwards from the newest order for "desc", or forwards
  // from order 1 for "asc" - until enough matches are found. Pure function: it only
  // fetches and returns data, the caller decides how to fold the result into state.
  const fetchPage = async (startId, filters, direction, max) => {
    const found = [];
    let id = startId;
    const step = direction === 'asc' ? 1 : -1;

    while (found.length < PAGE_SIZE && isInRange(id, max)) {
      const ids = [];
      for (let i = 0; i < SCAN_BATCH_SIZE && isInRange(id, max); i++, id += step) {
        ids.push(id);
      }

      const orders = await Promise.all(
        ids.map((orderId) =>
          fetch(`https://lapista.depistezulte.be/api/order/${orderId}`)
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null)
        )
      );

      orders.forEach((order) => {
        if (order && matchesFilters(order, filters)) {
          found.push(order);
        }
      });
    }

    return { orders: found, nextId: id };
  };

  const currentFilters = () => ({ tafel: tafelFilter, from: dateFrom, to: dateTo });

  const loadCachedOrders = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error('Error reading cached orders:', err);
      return null;
    }
  };

  const saveCachedOrders = (cache) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (err) {
      console.error('Error caching orders:', err);
    }
  };

  // Rescanning ~1700+ orders one by one is expensive, so the loaded pages are cached in
  // localStorage. Reopening this screen restores the last view instantly instead of
  // rescanning from scratch - use "Vernieuwen" to pick up orders placed since then.
  useEffect(() => {
    const cached = loadCachedOrders();
    if (cached) {
      setMaxOrderId(cached.maxOrderId);
      setTafelFilter(cached.tafelFilter);
      setDateFrom(cached.dateFrom);
      setDateTo(cached.dateTo);
      setSortOrder(cached.sortOrder);
      setPages(cached.pages);
      setCurrentPage(cached.currentPage);
      setNextCursor(cached.nextCursor);
      setCachedAt(cached.cachedAt);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const max = await findMaxOrderId();
        setMaxOrderId(max);
        setLoading(false);
        const start = sortOrder === 'asc' ? 1 : max;
        const { orders, nextId } = await fetchPage(start, { tafel: '', from: '', to: '' }, sortOrder, max);
        setPages([orders]);
        setCurrentPage(0);
        setNextCursor(nextId);
        persistCache(max, { tafel: '', from: '', to: '' }, sortOrder, [orders], 0, nextId);
      } catch (err) {
        console.error('Error finding latest order:', err);
        setError('Kon de bestellingen niet ophalen.');
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistCache = (max, filters, direction, newPages, page, cursor) => {
    const now = new Date().toISOString();
    setCachedAt(now);
    saveCachedOrders({
      maxOrderId: max,
      tafelFilter: filters.tafel,
      dateFrom: filters.from,
      dateTo: filters.to,
      sortOrder: direction,
      pages: newPages,
      currentPage: page,
      nextCursor: cursor,
      cachedAt: now,
    });
  };

  const refreshOrders = () => {
    localStorage.removeItem(CACHE_KEY);
    setPages([]);
    setCurrentPage(0);
    setMaxOrderId(null);
    setLoading(true);
    setCachedAt(null);
    (async () => {
      try {
        const max = await findMaxOrderId();
        setMaxOrderId(max);
        setLoading(false);
        const filters = currentFilters();
        const start = sortOrder === 'asc' ? 1 : max;
        const { orders, nextId } = await fetchPage(start, filters, sortOrder, max);
        setPages([orders]);
        setCurrentPage(0);
        setNextCursor(nextId);
        persistCache(max, filters, sortOrder, [orders], 0, nextId);
      } catch (err) {
        console.error('Error refreshing orders:', err);
        setError('Kon de bestellingen niet ophalen.');
        setLoading(false);
      }
    })();
  };

  const hasMore = (cursor, max) => isInRange(cursor, max);

  // Restart the scan from the given end of the id range, replacing all loaded pages
  const restartScan = async (filters, direction) => {
    if (maxOrderId === null) return;
    setScanning(true);
    setError(null);
    try {
      const start = direction === 'asc' ? 1 : maxOrderId;
      const { orders, nextId } = await fetchPage(start, filters, direction, maxOrderId);
      setPages([orders]);
      setCurrentPage(0);
      setNextCursor(nextId);
      persistCache(maxOrderId, filters, direction, [orders], 0, nextId);
    } catch (err) {
      console.error('Error scanning orders:', err);
      setError('Kon de bestellingen niet ophalen.');
    } finally {
      setScanning(false);
    }
  };

  const goNext = async () => {
    if (currentPage < pages.length - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      persistCache(maxOrderId, currentFilters(), sortOrder, pages, newPage, nextCursor);
      return;
    }
    if (!hasMore(nextCursor, maxOrderId)) return;

    setScanning(true);
    setError(null);
    try {
      const { orders, nextId } = await fetchPage(nextCursor, currentFilters(), sortOrder, maxOrderId);
      const newPages = [...pages, orders];
      setPages(newPages);
      setCurrentPage(newPages.length - 1);
      setNextCursor(nextId);
      persistCache(maxOrderId, currentFilters(), sortOrder, newPages, newPages.length - 1, nextId);
    } catch (err) {
      console.error('Error scanning orders:', err);
      setError('Kon de volgende pagina niet ophalen.');
    } finally {
      setScanning(false);
    }
  };

  const goPrev = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      persistCache(maxOrderId, currentFilters(), sortOrder, pages, newPage, nextCursor);
    }
  };

  const goFirst = () => {
    setCurrentPage(0);
    persistCache(maxOrderId, currentFilters(), sortOrder, pages, 0, nextCursor);
  };

  const goLast = async () => {
    setScanning(true);
    setError(null);
    try {
      const filters = currentFilters();
      const allPages = [...pages];
      let cursor = nextCursor;
      while (hasMore(cursor, maxOrderId)) {
        const { orders, nextId } = await fetchPage(cursor, filters, sortOrder, maxOrderId);
        allPages.push(orders);
        cursor = nextId;
      }
      setPages(allPages);
      setCurrentPage(allPages.length - 1);
      setNextCursor(cursor);
      persistCache(maxOrderId, filters, sortOrder, allPages, allPages.length - 1, cursor);
    } catch (err) {
      console.error('Error scanning orders:', err);
      setError('Kon de laatste pagina niet ophalen.');
    } finally {
      setScanning(false);
    }
  };

  const applyFilters = (e) => {
    e.preventDefault();
    restartScan(currentFilters(), sortOrder);
  };

  const clearFilters = () => {
    setTafelFilter('');
    setDateFrom('');
    setDateTo('');
    restartScan({ tafel: '', from: '', to: '' }, sortOrder);
  };

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newSortOrder);
    restartScan(currentFilters(), newSortOrder);
  };

  const calculateOrderTotal = (order) => {
    return order.orderlines.reduce((sum, line) => sum + (line.prijs || 0) * (line.hoeveelheid || 0), 0);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('nl-BE', {
      timeZone: 'Europe/Brussels',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currentOrders = pages[currentPage] || [];
  const noPagesYet = pages.length === 0 && !scanning;
  const isLastLoadedPage = currentPage === pages.length - 1;
  const canGoNext = !isLastLoadedPage || hasMore(nextCursor, maxOrderId);
  const canGoLast = canGoNext;

  return (
    <div className="orders-history-container">
      <NavBar />
      <h2 className="orders-history-title">Bestellingen</h2>

      {loading && <p>Laden...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && (
        <>
          <form className="orders-history-filters" onSubmit={applyFilters}>
            <input
              type="text"
              placeholder="Tafel (bv. S222)"
              value={tafelFilter}
              onChange={(e) => setTafelFilter(e.target.value)}
              className="orders-history-input"
            />
            <label className="orders-history-label">
              Van
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="orders-history-input"
              />
            </label>
            <label className="orders-history-label">
              Tot
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="orders-history-input"
              />
            </label>
            <button type="submit" className="button-product">Filter</button>
            <button type="button" className="button-product" onClick={clearFilters}>Wis filters</button>
            <button type="button" className="button-product" onClick={refreshOrders} disabled={scanning}>Vernieuwen</button>
          </form>

          {cachedAt && !scanning && (
            <p className="progress-text-product">
              Laatst vernieuwd: {new Date(cachedAt).toLocaleString('nl-BE', { timeZone: 'Europe/Brussels' })}
            </p>
          )}

          {scanning && <p>Bestellingen laden...</p>}

          {currentOrders.length > 0 && (
            <div className="table-wrapper-product">
              <table className="data-table-product">
                <thead>
                  <tr>
                    <th className="orders-history-sortable-header" onClick={toggleSortOrder}>
                      Order ID {sortOrder === 'desc' ? '▼' : '▲'}
                    </th>
                    <th>Tafel</th>
                    <th>Datum</th>
                    <th>Producten</th>
                    <th>Totaal</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>
                        <button className="orders-history-tafel-link" onClick={() => history.push(`/tafel/${order.tafel_id}`)}>
                          {order.tafel_id}
                        </button>
                      </td>
                      <td>{formatDate(order.creation)}</td>
                      <td className="orders-history-products-cell">
                        {order.orderlines.map((line) => `${line.hoeveelheid}x ${line.naam}`).join(', ')}
                      </td>
                      <td>{calculateOrderTotal(order)}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!noPagesYet && currentOrders.length === 0 && !scanning && (
            <p className="empty-product">Geen bestellingen gevonden die aan de filters voldoen.</p>
          )}

          {pages.length > 0 && (
            <div className="orders-history-pagination">
              <button className="button-product" onClick={goFirst} disabled={currentPage === 0 || scanning}>
                Eerste
              </button>
              <button className="button-product" onClick={goPrev} disabled={currentPage === 0 || scanning}>
                Vorige
              </button>
              <span>Pagina {currentPage + 1}</span>
              <button className="button-product" onClick={goNext} disabled={scanning || !canGoNext}>
                {scanning ? 'Laden...' : 'Volgende'}
              </button>
              <button className="button-product" onClick={goLast} disabled={scanning || !canGoLast}>
                Laatste
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OrdersHistoryScreen;
